package models

import "time"

// ── Product Catalog ──────────────────────────────────────────────────────────

type Color struct {
	Name string `json:"name"`
	Hex  string `json:"hex"`
}

type Product struct {
	ID          int64     `json:"id"`
	StyleID     string    `json:"style_id"`
	Brand       string    `json:"brand"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`  // beauty|apparel|home|shoes|accessories|tech|wellness|toys
	Price       float64   `json:"price"`
	SalePrice   *float64  `json:"sale_price,omitempty"`
	Rating      float64   `json:"rating"`
	ReviewCount int       `json:"review_count"`
	ImageURL    string    `json:"image_url"`
	BadgeLabel  *string   `json:"badge,omitempty"`
	BadgeType   *string   `json:"badge_type,omitempty"`
	Colors      []Color   `json:"colors"`
	Sizes       []string  `json:"sizes"`
	Recipients  []string  `json:"recipients"`  // her|him|kids|teens|pets
	Active      bool      `json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ProductListParams struct {
	Category  string
	Recipient string
	MinPrice  *float64
	MaxPrice  *float64
	OnSale    *bool
	Search    string
	SortBy    string // price_asc|price_desc|rating|newest
	Page      int
	PageSize  int
}

type ProductListResult struct {
	Products   []Product `json:"products"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	PageSize   int       `json:"page_size"`
	TotalPages int       `json:"total_pages"`
}

// ── Editorial Products (Gift Edit) ──────────────────────────────────────────

type EditorialProduct struct {
	ID                int64    `json:"id"`
	ProductID         int64    `json:"product_id"`
	EditorialHeadline string   `json:"editorial_headline"`
	EditorialCopy     string   `json:"editorial_copy"`
	Attribution       string   `json:"attribution"` // fashion-office|buyer|stylist
	FilterRecipient   []string `json:"filter_recipient"`
	FilterTheme       []string `json:"filter_theme"`   // cozy|luxury|practical|outdoor|wellness|host-gift|stocking-stuffer
	FilterPrice       string   `json:"filter_price"`   // under-50|50-100|100-200|200-plus
	SortOrder         int      `json:"sort_order"`
	Active            bool     `json:"active"`
	// Joined product fields
	Product *Product `json:"product,omitempty"`
}

type EditorialListParams struct {
	Recipient string
	Theme     string
	Price     string
}

type UpsertEditorialRequest struct {
	EditorialHeadline string   `json:"editorial_headline"`
	EditorialCopy     string   `json:"editorial_copy"`
	Attribution       string   `json:"attribution"`
	FilterRecipient   []string `json:"filter_recipient"`
	FilterTheme       []string `json:"filter_theme"`
	FilterPrice       string   `json:"filter_price"`
	Active            bool     `json:"active"`
}

// ── Inventory ────────────────────────────────────────────────────────────────

type InventoryStatus string

const (
	StatusInStock    InventoryStatus = "in_stock"
	StatusLowStock   InventoryStatus = "low_stock"
	StatusOutOfStock InventoryStatus = "out_of_stock"
)

type InventoryEntry struct {
	ID           int64           `json:"id"`
	ProductID    int64           `json:"product_id"`
	StyleID      string          `json:"style_id"`
	Size         string          `json:"size"`
	ColorName    string          `json:"color_name"`
	Quantity     int             `json:"quantity"`
	Status       InventoryStatus `json:"status"`
	ReservedQty  int             `json:"reserved_qty"`
	AvailableQty int             `json:"available_qty"`
	LastSyncedAt time.Time       `json:"last_synced_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

type InventoryAdjustment struct {
	ProductID int64  `json:"product_id"`
	StyleID   string `json:"style_id"`
	Size      string `json:"size"`
	ColorName string `json:"color_name"`
	Delta     int    `json:"delta"` // positive = restock, negative = sold/reserve
	Reason    string `json:"reason"`
}

type ProductInventory struct {
	ProductID int64            `json:"product_id"`
	StyleID   string           `json:"style_id"`
	Variants  []InventoryEntry `json:"variants"`
	InStock   bool             `json:"in_stock"` // true if ANY variant has qty > 0
}
