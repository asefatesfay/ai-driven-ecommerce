package db

import (
	"database/sql"
	"fmt"

	"github.com/ai-ecommerce/checkout/internal/models"
)

func GetOrCreateCart(db *sql.DB, userID int64, sessionID string) (*models.Cart, error) {
	var cart models.Cart
	var err error

	var nullUserID sql.NullInt64
	if userID > 0 {
		err = db.QueryRow(
			"SELECT id, user_id, session_id, created_at, updated_at FROM carts WHERE user_id = ?",
			userID,
		).Scan(&cart.ID, &nullUserID, &cart.SessionID, &cart.CreatedAt, &cart.UpdatedAt)
	} else {
		err = db.QueryRow(
			"SELECT id, user_id, session_id, created_at, updated_at FROM carts WHERE session_id = ?",
			sessionID,
		).Scan(&cart.ID, &nullUserID, &cart.SessionID, &cart.CreatedAt, &cart.UpdatedAt)
	}
	if nullUserID.Valid {
		cart.UserID = nullUserID.Int64
	}

	if err == sql.ErrNoRows {
		var userIDVal any
		if userID > 0 {
			userIDVal = userID
		}
		res, err := db.Exec(
			"INSERT INTO carts (user_id, session_id) VALUES (?, ?)",
			userIDVal, sessionID,
		)
		if err != nil {
			return nil, fmt.Errorf("create cart: %w", err)
		}
		id, _ := res.LastInsertId()
		cart.ID = id
		cart.UserID = userID
		cart.SessionID = sessionID
	} else if err != nil {
		return nil, err
	}

	items, err := GetCartItems(db, cart.ID)
	if err != nil {
		return nil, err
	}
	cart.Items = items
	cart.ItemCount = len(items)
	for _, item := range items {
		cart.Subtotal += item.UnitPrice * float64(item.Quantity)
	}
	return &cart, nil
}

func GetCartItems(db *sql.DB, cartID int64) ([]models.CartItem, error) {
	rows, err := db.Query(
		`SELECT id, cart_id, product_id, style_id, name, brand, image_url,
		        size, color_name, quantity, unit_price, added_at
		 FROM cart_items WHERE cart_id = ? ORDER BY added_at ASC`, cartID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var item models.CartItem
		if err := rows.Scan(
			&item.ID, &item.CartID, &item.ProductID, &item.StyleID, &item.Name, &item.Brand,
			&item.ImageURL, &item.Size, &item.ColorName, &item.Quantity, &item.UnitPrice, &item.AddedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func AddToCart(db *sql.DB, cartID int64, req models.AddToCartRequest) error {
	_, err := db.Exec(`
		INSERT INTO cart_items (cart_id, product_id, style_id, name, brand, image_url, size, color_name, quantity, unit_price)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(cart_id, product_id, size, color_name)
		DO UPDATE SET quantity = quantity + excluded.quantity`,
		cartID, req.ProductID, req.StyleID, req.Name, req.Brand,
		req.ImageURL, req.Size, req.ColorName, req.Quantity, req.UnitPrice,
	)
	return err
}

func UpdateCartItem(db *sql.DB, cartID, itemID int64, quantity int) error {
	if quantity <= 0 {
		_, err := db.Exec("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", itemID, cartID)
		return err
	}
	_, err := db.Exec(
		"UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?",
		quantity, itemID, cartID,
	)
	return err
}

func RemoveFromCart(db *sql.DB, cartID, itemID int64) error {
	_, err := db.Exec("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", itemID, cartID)
	return err
}

func ClearCart(db *sql.DB, cartID int64) error {
	_, err := db.Exec("DELETE FROM cart_items WHERE cart_id = ?", cartID)
	return err
}
