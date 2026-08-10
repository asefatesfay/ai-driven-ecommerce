package models

import "time"

type PaymentStatus string

const (
	StatusPending    PaymentStatus = "pending"
	StatusAuthorised PaymentStatus = "authorised"
	StatusDeclined   PaymentStatus = "declined"
	StatusRefunded   PaymentStatus = "refunded"
)

type Payment struct {
	ID          int64         `json:"id"`
	SessionID   string        `json:"session_id"`
	OrderRef    string        `json:"order_ref"`
	Amount      float64       `json:"amount"`
	Currency    string        `json:"currency"`
	Status      PaymentStatus `json:"status"`
	CardLast4   string        `json:"card_last4"`
	CardBrand   string        `json:"card_brand"`
	NameOnCard  string        `json:"name_on_card"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

type AuthoriseRequest struct {
	SessionID   string  `json:"session_id"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	CardNumber  string  `json:"card_number"`
	ExpiryMonth string  `json:"expiry_month"`
	ExpiryYear  string  `json:"expiry_year"`
	CVV         string  `json:"cvv"`
	NameOnCard  string  `json:"name_on_card"`
}

type AuthoriseResponse struct {
	Payment *Payment `json:"payment"`
	Success bool     `json:"success"`
	Message string   `json:"message"`
}
