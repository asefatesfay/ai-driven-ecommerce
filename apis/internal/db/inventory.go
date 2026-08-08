package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/nordstrom/gift-edit/api/internal/models"
)

func GetProductInventory(db *sql.DB, productID int64) (*models.ProductInventory, error) {
	rows, err := db.Query(`
		SELECT id, product_id, style_id, size, color_name,
		       quantity, reserved_qty, last_synced_at, updated_at
		FROM inventory WHERE product_id = ? ORDER BY size, color_name`,
		productID)
	if err != nil {
		return nil, fmt.Errorf("get inventory: %w", err)
	}
	defer rows.Close()

	inv := &models.ProductInventory{ProductID: productID}
	for rows.Next() {
		e, err := scanInventoryRow(rows)
		if err != nil {
			return nil, err
		}
		e.AvailableQty = e.Quantity - e.ReservedQty
		if e.AvailableQty < 0 {
			e.AvailableQty = 0
		}
		e.Status = statusFromQty(e.AvailableQty)
		inv.Variants = append(inv.Variants, *e)
		if e.AvailableQty > 0 {
			inv.InStock = true
		}
	}
	if len(inv.Variants) > 0 {
		inv.StyleID = inv.Variants[0].StyleID
	}
	return inv, nil
}

func GetInventoryByStyleIDs(db *sql.DB, styleIDs []string) (map[string]*models.ProductInventory, error) {
	if len(styleIDs) == 0 {
		return map[string]*models.ProductInventory{}, nil
	}

	placeholders := make([]byte, 0, len(styleIDs)*2)
	args := make([]any, len(styleIDs))
	for i, id := range styleIDs {
		if i > 0 {
			placeholders = append(placeholders, ',')
		}
		placeholders = append(placeholders, '?')
		args[i] = id
	}

	rows, err := db.Query(fmt.Sprintf(`
		SELECT id, product_id, style_id, size, color_name,
		       quantity, reserved_qty, last_synced_at, updated_at
		FROM inventory WHERE style_id IN (%s)
		ORDER BY style_id, size, color_name`, string(placeholders)), args...)
	if err != nil {
		return nil, fmt.Errorf("bulk inventory: %w", err)
	}
	defer rows.Close()

	result := map[string]*models.ProductInventory{}
	for rows.Next() {
		e, err := scanInventoryRow(rows)
		if err != nil {
			return nil, err
		}
		e.AvailableQty = e.Quantity - e.ReservedQty
		if e.AvailableQty < 0 {
			e.AvailableQty = 0
		}
		e.Status = statusFromQty(e.AvailableQty)

		inv, ok := result[e.StyleID]
		if !ok {
			inv = &models.ProductInventory{ProductID: e.ProductID, StyleID: e.StyleID}
			result[e.StyleID] = inv
		}
		inv.Variants = append(inv.Variants, *e)
		if e.AvailableQty > 0 {
			inv.InStock = true
		}
	}
	return result, nil
}

func AdjustInventory(db *sql.DB, adj models.InventoryAdjustment) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() //nolint:errcheck

	res, err := tx.Exec(`
		UPDATE inventory
		SET quantity = MAX(0, quantity + ?),
		    updated_at = datetime('now')
		WHERE product_id=? AND size=? AND color_name=?`,
		adj.Delta, adj.ProductID, adj.Size, adj.ColorName,
	)
	if err != nil {
		return fmt.Errorf("adjust inventory: %w", err)
	}

	n, _ := res.RowsAffected()
	if n == 0 {
		// Row doesn't exist yet — create it (restock scenario)
		qty := adj.Delta
		if qty < 0 {
			qty = 0
		}
		if _, err := tx.Exec(`
			INSERT INTO inventory (product_id, style_id, size, color_name, quantity)
			VALUES (?,?,?,?,?)`,
			adj.ProductID, adj.StyleID, adj.Size, adj.ColorName, qty,
		); err != nil {
			return fmt.Errorf("insert inventory: %w", err)
		}
	}

	// Write log entry
	if _, err := tx.Exec(`
		INSERT INTO inventory_log (product_id, style_id, size, color_name, delta, reason)
		VALUES (?,?,?,?,?,?)`,
		adj.ProductID, adj.StyleID, adj.Size, adj.ColorName, adj.Delta, adj.Reason,
	); err != nil {
		return fmt.Errorf("insert inventory log: %w", err)
	}

	return tx.Commit()
}

// SyncInventory runs the hourly editorial active-flag sync.
// It marks editorial products inactive when all their inventory is OOS,
// and reactivates them when they come back in stock.
func SyncInventory(db *sql.DB) (deactivated int, reactivated int, err error) {
	// Find editorial products whose product is now OOS
	rows, err := db.Query(`
		SELECT e.id, e.product_id, e.active,
		       COALESCE(SUM(i.quantity - i.reserved_qty), 0) AS available
		FROM editorial_products e
		LEFT JOIN inventory i ON i.product_id = e.product_id
		GROUP BY e.id`)
	if err != nil {
		return 0, 0, fmt.Errorf("sync query: %w", err)
	}
	defer rows.Close()

	type row struct {
		id        int64
		productID int64
		active    bool
		available int
	}
	var items []row
	for rows.Next() {
		var r row
		var activeInt int
		if err := rows.Scan(&r.id, &r.productID, &activeInt, &r.available); err != nil {
			return 0, 0, err
		}
		r.active = activeInt == 1
		items = append(items, r)
	}

	now := time.Now()
	for _, item := range items {
		shouldBeActive := item.available > 0
		if item.active && !shouldBeActive {
			db.Exec("UPDATE editorial_products SET active=0 WHERE id=?", item.id) //nolint:errcheck
			db.Exec("UPDATE inventory SET last_synced_at=? WHERE product_id=?", now, item.productID) //nolint:errcheck
			deactivated++
		} else if !item.active && shouldBeActive {
			db.Exec("UPDATE editorial_products SET active=1 WHERE id=?", item.id) //nolint:errcheck
			reactivated++
		}
	}
	return deactivated, reactivated, nil
}

func scanInventoryRow(rows *sql.Rows) (*models.InventoryEntry, error) {
	var e models.InventoryEntry
	return &e, rows.Scan(
		&e.ID, &e.ProductID, &e.StyleID, &e.Size, &e.ColorName,
		&e.Quantity, &e.ReservedQty, &e.LastSyncedAt, &e.UpdatedAt,
	)
}

func statusFromQty(available int) models.InventoryStatus {
	switch {
	case available == 0:
		return models.StatusOutOfStock
	case available <= 3:
		return models.StatusLowStock
	default:
		return models.StatusInStock
	}
}
