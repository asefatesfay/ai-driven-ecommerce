package db

import (
	"database/sql"

	"github.com/ai-ecommerce/checkout/internal/models"
)

func GetWishlist(db *sql.DB, userID int64) ([]models.WishlistItem, error) {
	rows, err := db.Query(
		`SELECT id, user_id, product_id, style_id, name, brand, image_url, price, sale_price, added_at
		 FROM wishlists WHERE user_id = ? ORDER BY added_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.WishlistItem
	for rows.Next() {
		var item models.WishlistItem
		if err := rows.Scan(
			&item.ID, &item.UserID, &item.ProductID, &item.StyleID,
			&item.Name, &item.Brand, &item.ImageURL, &item.Price, &item.SalePrice, &item.AddedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func AddToWishlist(db *sql.DB, userID int64, req models.AddToWishlistRequest) error {
	_, err := db.Exec(`
		INSERT OR IGNORE INTO wishlists (user_id, product_id, style_id, name, brand, image_url, price)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		userID, req.ProductID, req.StyleID, req.Name, req.Brand, req.ImageURL, req.Price,
	)
	return err
}

func RemoveFromWishlist(db *sql.DB, userID, productID int64) error {
	_, err := db.Exec(
		"DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
		userID, productID,
	)
	return err
}

func IsInWishlist(db *sql.DB, userID, productID int64) (bool, error) {
	var count int
	err := db.QueryRow(
		"SELECT COUNT(*) FROM wishlists WHERE user_id = ? AND product_id = ?",
		userID, productID,
	).Scan(&count)
	return count > 0, err
}

func MoveWishlistToCart(db *sql.DB, userID, productID, cartID int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() //nolint:errcheck

	var item models.WishlistItem
	if err := tx.QueryRow(
		"SELECT id, product_id, style_id, name, brand, image_url, price FROM wishlists WHERE user_id = ? AND product_id = ?",
		userID, productID,
	).Scan(&item.ID, &item.ProductID, &item.StyleID, &item.Name, &item.Brand, &item.ImageURL, &item.Price); err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO cart_items (cart_id, product_id, style_id, name, brand, image_url, quantity, unit_price)
		VALUES (?, ?, ?, ?, ?, ?, 1, ?)
		ON CONFLICT(cart_id, product_id, size, color_name) DO UPDATE SET quantity = quantity + 1`,
		cartID, item.ProductID, item.StyleID, item.Name, item.Brand, item.ImageURL, item.Price,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM wishlists WHERE id = ?", item.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func GetWishlistByProductIDs(db *sql.DB, userID int64, productIDs []int64) (map[int64]bool, error) {
	if len(productIDs) == 0 {
		return map[int64]bool{}, nil
	}
	result := make(map[int64]bool, len(productIDs))
	rows, err := db.Query(
		"SELECT product_id FROM wishlists WHERE user_id = ?", userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var id int64
		rows.Scan(&id) //nolint:errcheck
		result[id] = true
	}
	return result, nil
}
