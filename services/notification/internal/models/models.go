package models

import "time"

type NotificationType string
type NotificationChannel string
type NotificationStatus string

const (
	TypeOrderConfirmed  NotificationType = "order_confirmed"
	TypeOrderShipped    NotificationType = "order_shipped"
	TypeOrderDelivered  NotificationType = "order_delivered"
	TypeOrderCancelled  NotificationType = "order_cancelled"
	TypePriceAlert      NotificationType = "price_alert"
	TypeBackInStock     NotificationType = "back_in_stock"
	TypeWelcome         NotificationType = "welcome"
	TypePasswordReset   NotificationType = "password_reset"

	ChannelEmail  NotificationChannel = "email"
	ChannelSMS    NotificationChannel = "sms"
	ChannelInApp  NotificationChannel = "in_app"
	ChannelPush   NotificationChannel = "push"

	StatusPending   NotificationStatus = "pending"
	StatusSent      NotificationStatus = "sent"
	StatusFailed    NotificationStatus = "failed"
	StatusDelivered NotificationStatus = "delivered"
)

type Notification struct {
	ID        int64              `json:"id"`
	UserID    int64              `json:"user_id"`
	Type      NotificationType   `json:"type"`
	Channel   NotificationChannel `json:"channel"`
	Status    NotificationStatus `json:"status"`
	Subject   string             `json:"subject"`
	Body      string             `json:"body"`
	Metadata  string             `json:"metadata"` // JSON payload
	SentAt    *time.Time         `json:"sent_at,omitempty"`
	CreatedAt time.Time          `json:"created_at"`
}

type SendNotificationRequest struct {
	UserID   int64               `json:"user_id"`
	Type     NotificationType    `json:"type"`
	Channel  NotificationChannel `json:"channel"`
	Metadata map[string]any      `json:"metadata"`
}

type NotificationPreferences struct {
	UserID       int64 `json:"user_id"`
	EmailEnabled bool  `json:"email_enabled"`
	SMSEnabled   bool  `json:"sms_enabled"`
	PushEnabled  bool  `json:"push_enabled"`
	OrderUpdates bool  `json:"order_updates"`
	Promotions   bool  `json:"promotions"`
	PriceAlerts  bool  `json:"price_alerts"`
}
