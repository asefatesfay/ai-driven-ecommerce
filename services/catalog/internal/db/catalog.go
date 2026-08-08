package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/ai-ecommerce/catalog/internal/models"

	_ "github.com/mattn/go-sqlite3"
)

// ── Catalog queries ──────────────────────────────────────────────────────────

func GetProduct(db *sql.DB, id int64) (*models.Product, error) {
	row := db.QueryRow(`
		SELECT id, style_id, brand, name, description, category,
		       price, sale_price, rating, review_count, image_url,
		       badge_label, badge_type, active, created_at, updated_at
		FROM products WHERE id = ?`, id)
	p, err := scanProduct(row)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	products, err := loadRelationsForIDs(db, []*models.Product{p})
	if err != nil {
		return nil, err
	}
	return products[0], nil
}

func GetProductByStyleID(db *sql.DB, styleID string) (*models.Product, error) {
	row := db.QueryRow(`
		SELECT id, style_id, brand, name, description, category,
		       price, sale_price, rating, review_count, image_url,
		       badge_label, badge_type, active, created_at, updated_at
		FROM products WHERE style_id = ?`, styleID)
	p, err := scanProduct(row)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	products, err := loadRelationsForIDs(db, []*models.Product{p})
	if err != nil {
		return nil, err
	}
	return products[0], nil
}

func ListProducts(db *sql.DB, params models.ProductListParams) (*models.ProductListResult, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 || params.PageSize > 100 {
		params.PageSize = 48
	}

	where := []string{"p.active = 1"}
	args := []any{}

	if params.Category != "" {
		where = append(where, "p.category = ?")
		args = append(args, params.Category)
	}
	if params.MinPrice != nil {
		where = append(where, "COALESCE(p.sale_price, p.price) >= ?")
		args = append(args, *params.MinPrice)
	}
	if params.MaxPrice != nil {
		where = append(where, "COALESCE(p.sale_price, p.price) <= ?")
		args = append(args, *params.MaxPrice)
	}
	if params.OnSale != nil && *params.OnSale {
		where = append(where, "p.sale_price IS NOT NULL")
	}
	if params.Search != "" {
		where = append(where, "(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)")
		q := "%" + params.Search + "%"
		args = append(args, q, q, q)
	}
	if params.Recipient != "" {
		where = append(where, `EXISTS (
			SELECT 1 FROM product_recipients pr
			WHERE pr.product_id = p.id AND pr.recipient = ?)`)
		args = append(args, params.Recipient)
	}

	whereClause := "WHERE " + strings.Join(where, " AND ")

	orderClause := "ORDER BY p.id DESC"
	switch params.SortBy {
	case "price_asc":
		orderClause = "ORDER BY COALESCE(p.sale_price, p.price) ASC"
	case "price_desc":
		orderClause = "ORDER BY COALESCE(p.sale_price, p.price) DESC"
	case "rating":
		orderClause = "ORDER BY p.rating DESC, p.review_count DESC"
	case "newest":
		orderClause = "ORDER BY p.created_at DESC"
	}

	// Count total
	var total int
	countArgs := append([]any{}, args...)
	if err := db.QueryRow(
		fmt.Sprintf("SELECT COUNT(*) FROM products p %s", whereClause),
		countArgs...,
	).Scan(&total); err != nil {
		return nil, fmt.Errorf("count products: %w", err)
	}

	offset := (params.Page - 1) * params.PageSize
	pageArgs := append(args, params.PageSize, offset)
	rows, err := db.Query(
		fmt.Sprintf(`SELECT p.id, p.style_id, p.brand, p.name, p.description, p.category,
			p.price, p.sale_price, p.rating, p.review_count, p.image_url,
			p.badge_label, p.badge_type, p.active, p.created_at, p.updated_at
			FROM products p %s %s LIMIT ? OFFSET ?`, whereClause, orderClause),
		pageArgs...,
	)
	if err != nil {
		return nil, fmt.Errorf("list products: %w", err)
	}

	var ptrs []*models.Product
	for rows.Next() {
		p, err := scanProductRow(rows)
		if err != nil {
			rows.Close()
			return nil, err
		}
		ptrs = append(ptrs, p)
	}
	rows.Close()

	if len(ptrs) > 0 {
		ptrs, err = loadRelationsForIDs(db, ptrs)
		if err != nil {
			return nil, err
		}
	}

	products := make([]models.Product, len(ptrs))
	for i, p := range ptrs {
		products[i] = *p
	}

	totalPages := (total + params.PageSize - 1) / params.PageSize
	return &models.ProductListResult{
		Products:   products,
		Total:      total,
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalPages: totalPages,
	}, nil
}

func CreateProduct(db *sql.DB, p *models.Product) (int64, error) {
	res, err := db.Exec(`
		INSERT INTO products
		    (style_id, brand, name, description, category, price, sale_price,
		     rating, review_count, image_url, badge_label, badge_type, active)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		p.StyleID, p.Brand, p.Name, p.Description, p.Category, p.Price, p.SalePrice,
		p.Rating, p.ReviewCount, p.ImageURL, p.BadgeLabel, p.BadgeType, p.Active,
	)
	if err != nil {
		return 0, fmt.Errorf("insert product: %w", err)
	}
	id, _ := res.LastInsertId()
	if err := upsertColors(db, id, p.Colors); err != nil {
		return 0, err
	}
	if err := upsertSizes(db, id, p.Sizes); err != nil {
		return 0, err
	}
	if err := upsertRecipients(db, id, p.Recipients); err != nil {
		return 0, err
	}
	return id, nil
}

func UpdateProduct(db *sql.DB, id int64, p *models.Product) error {
	_, err := db.Exec(`
		UPDATE products SET
		    brand=?, name=?, description=?, category=?, price=?, sale_price=?,
		    rating=?, review_count=?, image_url=?, badge_label=?, badge_type=?,
		    active=?, updated_at=datetime('now')
		WHERE id=?`,
		p.Brand, p.Name, p.Description, p.Category, p.Price, p.SalePrice,
		p.Rating, p.ReviewCount, p.ImageURL, p.BadgeLabel, p.BadgeType, p.Active, id,
	)
	if err != nil {
		return fmt.Errorf("update product: %w", err)
	}
	db.Exec("DELETE FROM product_colors WHERE product_id=?", id)
	db.Exec("DELETE FROM product_sizes WHERE product_id=?", id)
	db.Exec("DELETE FROM product_recipients WHERE product_id=?", id)
	if err := upsertColors(db, id, p.Colors); err != nil {
		return err
	}
	if err := upsertSizes(db, id, p.Sizes); err != nil {
		return err
	}
	return upsertRecipients(db, id, p.Recipients)
}

// ── Editorial queries ────────────────────────────────────────────────────────

func ListEditorialProducts(db *sql.DB, params models.EditorialListParams) ([]models.EditorialProduct, error) {
	where := []string{"e.active = 1"}
	args := []any{}

	if params.Recipient != "" {
		where = append(where, "e.filter_recipient LIKE ?")
		args = append(args, "%\""+params.Recipient+"\"%")
	}
	if params.Theme != "" {
		where = append(where, "e.filter_theme LIKE ?")
		args = append(args, "%\""+params.Theme+"\"%")
	}
	if params.Price != "" {
		where = append(where, "e.filter_price = ?")
		args = append(args, params.Price)
	}

	whereClause := "WHERE " + strings.Join(where, " AND ")
	rows, err := db.Query(
		fmt.Sprintf(`SELECT e.id, e.product_id, e.editorial_headline, e.editorial_copy,
			e.attribution, e.filter_recipient, e.filter_theme, e.filter_price,
			e.sort_order, e.active
			FROM editorial_products e %s ORDER BY e.sort_order ASC, e.id ASC`, whereClause),
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("list editorial products: %w", err)
	}

	type rawRow struct {
		ep            models.EditorialProduct
		recipientJSON string
		themeJSON     string
	}
	var raws []rawRow
	for rows.Next() {
		var r rawRow
		if err := rows.Scan(
			&r.ep.ID, &r.ep.ProductID, &r.ep.EditorialHeadline, &r.ep.EditorialCopy,
			&r.ep.Attribution, &r.recipientJSON, &r.themeJSON, &r.ep.FilterPrice,
			&r.ep.SortOrder, &r.ep.Active,
		); err != nil {
			rows.Close()
			return nil, err
		}
		raws = append(raws, r)
	}
	rows.Close()

	// Collect all product IDs needed, batch-load them
	productIDs := make([]int64, len(raws))
	for i, r := range raws {
		productIDs[i] = r.ep.ProductID
	}
	productMap, err := getProductsByIDs(db, productIDs)
	if err != nil {
		return nil, err
	}

	var items []models.EditorialProduct
	for _, r := range raws {
		ep := r.ep
		json.Unmarshal([]byte(r.recipientJSON), &ep.FilterRecipient) //nolint:errcheck
		json.Unmarshal([]byte(r.themeJSON), &ep.FilterTheme)         //nolint:errcheck
		if p, ok := productMap[ep.ProductID]; ok {
			ep.Product = p
		}
		items = append(items, ep)
	}
	return items, nil
}

// ── Batch relation loader — single query per relation table ──────────────────

// loadRelationsForIDs loads colors, sizes, and recipients for a batch of products
// using exactly 3 queries total regardless of batch size.
func loadRelationsForIDs(db *sql.DB, products []*models.Product) ([]*models.Product, error) {
	if len(products) == 0 {
		return products, nil
	}

	ids := make([]int64, len(products))
	index := map[int64]*models.Product{}
	for i, p := range products {
		ids[i] = p.ID
		index[p.ID] = p
		// Ensure slices are never nil so JSON serialises as [] not null
		p.Colors = []models.Color{}
		p.Sizes = []string{}
		p.Recipients = []string{}
	}

	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	// Colors
	colorRows, err := db.Query(
		fmt.Sprintf("SELECT product_id, name, hex FROM product_colors WHERE product_id IN (%s) ORDER BY id", placeholders),
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("load colors: %w", err)
	}
	for colorRows.Next() {
		var pid int64
		var c models.Color
		if err := colorRows.Scan(&pid, &c.Name, &c.Hex); err != nil {
			colorRows.Close()
			return nil, err
		}
		if p, ok := index[pid]; ok {
			p.Colors = append(p.Colors, c)
		}
	}
	colorRows.Close()

	// Sizes
	sizeRows, err := db.Query(
		fmt.Sprintf("SELECT product_id, size_label FROM product_sizes WHERE product_id IN (%s) ORDER BY product_id, sort_order, id", placeholders),
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("load sizes: %w", err)
	}
	for sizeRows.Next() {
		var pid int64
		var s string
		if err := sizeRows.Scan(&pid, &s); err != nil {
			sizeRows.Close()
			return nil, err
		}
		if p, ok := index[pid]; ok {
			p.Sizes = append(p.Sizes, s)
		}
	}
	sizeRows.Close()

	// Recipients
	recRows, err := db.Query(
		fmt.Sprintf("SELECT product_id, recipient FROM product_recipients WHERE product_id IN (%s)", placeholders),
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("load recipients: %w", err)
	}
	for recRows.Next() {
		var pid int64
		var r string
		if err := recRows.Scan(&pid, &r); err != nil {
			recRows.Close()
			return nil, err
		}
		if p, ok := index[pid]; ok {
			p.Recipients = append(p.Recipients, r)
		}
	}
	recRows.Close()

	return products, nil
}

// getProductsByIDs fetches products by a list of IDs in a single query and returns a map.
func getProductsByIDs(db *sql.DB, ids []int64) (map[int64]*models.Product, error) {
	if len(ids) == 0 {
		return map[int64]*models.Product{}, nil
	}

	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	rows, err := db.Query(
		fmt.Sprintf(`SELECT id, style_id, brand, name, description, category,
			price, sale_price, rating, review_count, image_url,
			badge_label, badge_type, active, created_at, updated_at
			FROM products WHERE id IN (%s)`, placeholders),
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("get products by ids: %w", err)
	}

	var ptrs []*models.Product
	for rows.Next() {
		p, err := scanProductRow(rows)
		if err != nil {
			rows.Close()
			return nil, err
		}
		ptrs = append(ptrs, p)
	}
	rows.Close()

	if len(ptrs) > 0 {
		if _, err := loadRelationsForIDs(db, ptrs); err != nil {
			return nil, err
		}
	}

	result := make(map[int64]*models.Product, len(ptrs))
	for _, p := range ptrs {
		result[p.ID] = p
	}
	return result, nil
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type scanner interface {
	Scan(dest ...any) error
}

func scanProduct(s scanner) (*models.Product, error) {
	var p models.Product
	return &p, s.Scan(
		&p.ID, &p.StyleID, &p.Brand, &p.Name, &p.Description, &p.Category,
		&p.Price, &p.SalePrice, &p.Rating, &p.ReviewCount, &p.ImageURL,
		&p.BadgeLabel, &p.BadgeType, &p.Active, &p.CreatedAt, &p.UpdatedAt,
	)
}

func scanProductRow(rows *sql.Rows) (*models.Product, error) {
	var p models.Product
	return &p, rows.Scan(
		&p.ID, &p.StyleID, &p.Brand, &p.Name, &p.Description, &p.Category,
		&p.Price, &p.SalePrice, &p.Rating, &p.ReviewCount, &p.ImageURL,
		&p.BadgeLabel, &p.BadgeType, &p.Active, &p.CreatedAt, &p.UpdatedAt,
	)
}

func upsertColors(db *sql.DB, productID int64, colors []models.Color) error {
	for _, c := range colors {
		if _, err := db.Exec(
			"INSERT INTO product_colors (product_id, name, hex) VALUES (?,?,?)",
			productID, c.Name, c.Hex,
		); err != nil {
			return fmt.Errorf("insert color: %w", err)
		}
	}
	return nil
}

func upsertSizes(db *sql.DB, productID int64, sizes []string) error {
	for i, s := range sizes {
		if _, err := db.Exec(
			"INSERT INTO product_sizes (product_id, size_label, sort_order) VALUES (?,?,?)",
			productID, s, i,
		); err != nil {
			return fmt.Errorf("insert size: %w", err)
		}
	}
	return nil
}

func upsertRecipients(db *sql.DB, productID int64, recipients []string) error {
	for _, r := range recipients {
		if _, err := db.Exec(
			"INSERT INTO product_recipients (product_id, recipient) VALUES (?,?)",
			productID, r,
		); err != nil {
			return fmt.Errorf("insert recipient: %w", err)
		}
	}
	return nil
}
