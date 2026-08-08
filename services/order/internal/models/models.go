package models

import "time"

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
	OrderStatusRefunded   OrderStatus = "refunded"
)

type OrderItem struct {
	ID        int64   `json:"id"`
	OrderID   int64   `json:"order_id"`
	ProductID int64   `json:"product_id"`
	StyleID   string  `json:"style_id"`
	Name      string  `json:"name"`
	Brand     string  `json:"brand"`
	ImageURL  string  `json:"image_url"`
	Size      string  `json:"size"`
	ColorName string  `json:"color_name"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
	Total     float64 `json:"total"`
}

type Address struct {
	Line1      string `json:"line1"`
	Line2      string `json:"line2,omitempty"`
	City       string `json:"city"`
	State      string `json:"state"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
}

type Order struct {
	ID              int64       `json:"id"`
	UserID          int64       `json:"user_id"`
	Status          OrderStatus `json:"status"`
	Items           []OrderItem `json:"items"`
	ShippingAddress Address     `json:"shipping_address"`
	Subtotal        float64     `json:"subtotal"`
	ShippingCost    float64     `json:"shipping_cost"`
	Tax             float64     `json:"tax"`
	Total           float64     `json:"total"`
	PaymentIntentID string      `json:"payment_intent_id,omitempty"`
	TrackingNumber  string      `json:"tracking_number,omitempty"`
	Notes           string      `json:"notes,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

type CreateOrderRequest struct {
	UserID          int64       `json:"user_id"`
	Items           []OrderItem `json:"items"`
	ShippingAddress Address     `json:"shipping_address"`
	PaymentIntentID string      `json:"payment_intent_id"`
}

type UpdateOrderStatusRequest struct {
	Status         OrderStatus `json:"status"`
	TrackingNumber string      `json:"tracking_number,omitempty"`
	Notes          string      `json:"notes,omitempty"`
}

type OrderListParams struct {
	UserID   int64
	Status   OrderStatus
	Page     int
	PageSize int
}

type OrderListResult struct {
	Orders     []Order `json:"orders"`
	Total      int     `json:"total"`
	Page       int     `json:"page"`
	PageSize   int     `json:"page_size"`
	TotalPages int     `json:"total_pages"`
}
