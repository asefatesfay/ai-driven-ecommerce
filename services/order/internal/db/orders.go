package db

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/ai-ecommerce/order/internal/models"
)

func CreateOrder(db *sql.DB, req *models.CreateOrderRequest) (*models.Order, error) {
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback() //nolint:errcheck

	addrJSON, _ := json.Marshal(req.ShippingAddress)

	var subtotal float64
	for _, item := range req.Items {
		subtotal += item.UnitPrice * float64(item.Quantity)
	}
	tax := subtotal * 0.08
	shippingCost := 0.0
	if subtotal < 100 {
		shippingCost = 8.99
	}
	total := subtotal + tax + shippingCost

	res, err := tx.Exec(`
		INSERT INTO orders (user_id, status, shipping_address, subtotal, shipping_cost, tax, total, payment_intent_id)
		VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)`,
		req.UserID, string(addrJSON), subtotal, shippingCost, tax, total, req.PaymentIntentID,
	)
	if err != nil {
		return nil, fmt.Errorf("insert order: %w", err)
	}
	orderID, _ := res.LastInsertId()

	for _, item := range req.Items {
		_, err := tx.Exec(`
			INSERT INTO order_items (order_id, product_id, style_id, name, brand, image_url, size, color_name, quantity, unit_price, total)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			orderID, item.ProductID, item.StyleID, item.Name, item.Brand,
			item.ImageURL, item.Size, item.ColorName, item.Quantity,
			item.UnitPrice, item.UnitPrice*float64(item.Quantity),
		)
		if err != nil {
			return nil, fmt.Errorf("insert order item: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return GetOrder(db, orderID)
}

func GetOrder(db *sql.DB, id int64) (*models.Order, error) {
	row := db.QueryRow(`
		SELECT id, user_id, status, shipping_address, subtotal, shipping_cost, tax, total,
		       payment_intent_id, tracking_number, notes, created_at, updated_at
		FROM orders WHERE id = ?`, id,
	)
	var o models.Order
	var addrJSON string
	if err := row.Scan(
		&o.ID, &o.UserID, &o.Status, &addrJSON,
		&o.Subtotal, &o.ShippingCost, &o.Tax, &o.Total,
		&o.PaymentIntentID, &o.TrackingNumber, &o.Notes,
		&o.CreatedAt, &o.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	json.Unmarshal([]byte(addrJSON), &o.ShippingAddress) //nolint:errcheck

	items, err := getOrderItems(db, id)
	if err != nil {
		return nil, err
	}
	o.Items = items
	return &o, nil
}

func ListOrdersByUser(db *sql.DB, params models.OrderListParams) (*models.OrderListResult, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 {
		params.PageSize = 20
	}

	where := "WHERE user_id = ?"
	args := []any{params.UserID}
	if params.Status != "" {
		where += " AND status = ?"
		args = append(args, params.Status)
	}

	var total int
	db.QueryRow("SELECT COUNT(*) FROM orders "+where, args...).Scan(&total) //nolint:errcheck

	offset := (params.Page - 1) * params.PageSize
	rows, err := db.Query(
		"SELECT id, user_id, status, shipping_address, subtotal, shipping_cost, tax, total, "+
			"payment_intent_id, tracking_number, notes, created_at, updated_at "+
			"FROM orders "+where+" ORDER BY created_at DESC LIMIT ? OFFSET ?",
		append(args, params.PageSize, offset)...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		var addrJSON string
		if err := rows.Scan(
			&o.ID, &o.UserID, &o.Status, &addrJSON,
			&o.Subtotal, &o.ShippingCost, &o.Tax, &o.Total,
			&o.PaymentIntentID, &o.TrackingNumber, &o.Notes,
			&o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(addrJSON), &o.ShippingAddress) //nolint:errcheck
		orders = append(orders, o)
	}
	rows.Close()

	for i := range orders {
		items, _ := getOrderItems(db, orders[i].ID)
		orders[i].Items = items
	}

	totalPages := (total + params.PageSize - 1) / params.PageSize
	return &models.OrderListResult{
		Orders: orders, Total: total,
		Page: params.Page, PageSize: params.PageSize, TotalPages: totalPages,
	}, nil
}

func UpdateOrderStatus(db *sql.DB, id int64, req models.UpdateOrderStatusRequest) error {
	_, err := db.Exec(
		`UPDATE orders SET status=?, tracking_number=?, notes=?, updated_at=datetime('now') WHERE id=?`,
		req.Status, req.TrackingNumber, req.Notes, id,
	)
	return err
}

func getOrderItems(db *sql.DB, orderID int64) ([]models.OrderItem, error) {
	rows, err := db.Query(
		`SELECT id, order_id, product_id, style_id, name, brand, image_url, size, color_name, quantity, unit_price, total
		 FROM order_items WHERE order_id = ?`, orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var item models.OrderItem
		if err := rows.Scan(
			&item.ID, &item.OrderID, &item.ProductID, &item.StyleID,
			&item.Name, &item.Brand, &item.ImageURL,
			&item.Size, &item.ColorName, &item.Quantity, &item.UnitPrice, &item.Total,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
