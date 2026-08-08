package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ai-ecommerce/notification/internal/models"
)

func CreateNotification(db *sql.DB, req models.SendNotificationRequest) (*models.Notification, error) {
	meta, _ := json.Marshal(req.Metadata)

	subject, body := renderTemplate(req.Type, req.Metadata)

	res, err := db.Exec(`
		INSERT INTO notifications (user_id, type, channel, status, subject, body, metadata)
		VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
		req.UserID, req.Type, req.Channel, subject, body, string(meta),
	)
	if err != nil {
		return nil, fmt.Errorf("insert notification: %w", err)
	}
	id, _ := res.LastInsertId()
	return GetNotification(db, id)
}

func GetNotification(db *sql.DB, id int64) (*models.Notification, error) {
	var n models.Notification
	err := db.QueryRow(`
		SELECT id, user_id, type, channel, status, subject, body, metadata, sent_at, created_at
		FROM notifications WHERE id = ?`, id,
	).Scan(&n.ID, &n.UserID, &n.Type, &n.Channel, &n.Status,
		&n.Subject, &n.Body, &n.Metadata, &n.SentAt, &n.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &n, err
}

func MarkSent(db *sql.DB, id int64) error {
	now := time.Now()
	_, err := db.Exec(
		"UPDATE notifications SET status='sent', sent_at=? WHERE id=?",
		now, id,
	)
	return err
}

func ListNotifications(db *sql.DB, userID int64, limit int) ([]models.Notification, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := db.Query(`
		SELECT id, user_id, type, channel, status, subject, body, metadata, sent_at, created_at
		FROM notifications WHERE user_id = ?
		ORDER BY created_at DESC LIMIT ?`, userID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.Notification
	for rows.Next() {
		var n models.Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Channel, &n.Status,
			&n.Subject, &n.Body, &n.Metadata, &n.SentAt, &n.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, n)
	}
	return items, nil
}

func GetPreferences(db *sql.DB, userID int64) (*models.NotificationPreferences, error) {
	var p models.NotificationPreferences
	err := db.QueryRow(`
		SELECT id, user_id, email_enabled, sms_enabled, push_enabled, order_updates, promotions, price_alerts
		FROM notification_preferences WHERE user_id = ?`, userID,
	).Scan(&p.UserID, &p.UserID, &p.EmailEnabled, &p.SMSEnabled, &p.PushEnabled,
		&p.OrderUpdates, &p.Promotions, &p.PriceAlerts)
	if err == sql.ErrNoRows {
		return &models.NotificationPreferences{
			UserID: userID, EmailEnabled: true, OrderUpdates: true,
			PushEnabled: true, Promotions: true, PriceAlerts: true,
		}, nil
	}
	return &p, err
}

func UpsertPreferences(db *sql.DB, p models.NotificationPreferences) error {
	_, err := db.Exec(`
		INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, push_enabled, order_updates, promotions, price_alerts)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(user_id) DO UPDATE SET
		  email_enabled=excluded.email_enabled, sms_enabled=excluded.sms_enabled,
		  push_enabled=excluded.push_enabled, order_updates=excluded.order_updates,
		  promotions=excluded.promotions, price_alerts=excluded.price_alerts,
		  updated_at=datetime('now')`,
		p.UserID, p.EmailEnabled, p.SMSEnabled, p.PushEnabled,
		p.OrderUpdates, p.Promotions, p.PriceAlerts,
	)
	return err
}

func renderTemplate(t models.NotificationType, meta map[string]any) (subject, body string) {
	switch t {
	case models.TypeOrderConfirmed:
		return "Your order has been confirmed!", "Thank you for your order. We're processing it now."
	case models.TypeOrderShipped:
		return "Your order has shipped!", "Great news — your package is on its way."
	case models.TypeOrderDelivered:
		return "Your order has been delivered", "We hope you love it! Leave a review."
	case models.TypeOrderCancelled:
		return "Your order has been cancelled", "Your order has been cancelled. Refunds process in 5-7 days."
	case models.TypePriceAlert:
		return "Price drop alert!", "An item on your wishlist just dropped in price."
	case models.TypeBackInStock:
		return "Back in stock!", "An item on your wishlist is back in stock."
	case models.TypeWelcome:
		return "Welcome!", "Welcome to AI Ecommerce. Start shopping."
	case models.TypePasswordReset:
		return "Reset your password", "Click the link below to reset your password."
	}
	return "Notification", ""
}
