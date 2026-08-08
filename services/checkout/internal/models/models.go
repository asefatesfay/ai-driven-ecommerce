package models

import "time"

// ── Cart ─────────────────────────────────────────────────────────────────────

type CartItem struct {
	ID        int64   `json:"id"`
	CartID    int64   `json:"cart_id"`
	ProductID int64   `json:"product_id"`
	StyleID   string  `json:"style_id"`
	Name      string  `json:"name"`
	Brand     string  `json:"brand"`
	ImageURL  string  `json:"image_url"`
	Size      string  `json:"size"`
	ColorName string  `json:"color_name"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
	AddedAt   time.Time `json:"added_at"`
}

type Cart struct {
	ID        int64      `json:"id"`
	UserID    int64      `json:"user_id"`
	SessionID string     `json:"session_id,omitempty"`
	Items     []CartItem `json:"items"`
	Subtotal  float64    `json:"subtotal"`
	ItemCount int        `json:"item_count"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type AddToCartRequest struct {
	ProductID int64   `json:"product_id"`
	StyleID   string  `json:"style_id"`
	Name      string  `json:"name"`
	Brand     string  `json:"brand"`
	ImageURL  string  `json:"image_url"`
	Size      string  `json:"size"`
	ColorName string  `json:"color_name"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity"`
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

type WishlistItem struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	ProductID int64     `json:"product_id"`
	StyleID   string    `json:"style_id"`
	Name      string    `json:"name"`
	Brand     string    `json:"brand"`
	ImageURL  string    `json:"image_url"`
	Price     float64   `json:"price"`
	SalePrice *float64  `json:"sale_price,omitempty"`
	AddedAt   time.Time `json:"added_at"`
}

type AddToWishlistRequest struct {
	ProductID int64   `json:"product_id"`
	StyleID   string  `json:"style_id"`
	Name      string  `json:"name"`
	Brand     string  `json:"brand"`
	ImageURL  string  `json:"image_url"`
	Price     float64 `json:"price"`
}
