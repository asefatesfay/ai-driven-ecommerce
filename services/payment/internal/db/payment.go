package db

import (
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/ai-ecommerce/payment/internal/models"
)

func CreatePayment(db *sql.DB, p *models.Payment) (int64, error) {
	res, err := db.Exec(`
		INSERT INTO payments (session_id, order_ref, amount, currency, status, card_last4, card_brand, name_on_card)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		p.SessionID, p.OrderRef, p.Amount, p.Currency, p.Status,
		p.CardLast4, p.CardBrand, p.NameOnCard,
	)
	if err != nil {
		return 0, fmt.Errorf("create payment: %w", err)
	}
	return res.LastInsertId()
}

func GetPayment(db *sql.DB, id int64) (*models.Payment, error) {
	row := db.QueryRow(`
		SELECT id, session_id, order_ref, amount, currency, status,
		       card_last4, card_brand, name_on_card, created_at, updated_at
		FROM payments WHERE id = ?`, id)
	return scanPayment(row)
}

func GetPaymentByOrderRef(db *sql.DB, orderRef string) (*models.Payment, error) {
	row := db.QueryRow(`
		SELECT id, session_id, order_ref, amount, currency, status,
		       card_last4, card_brand, name_on_card, created_at, updated_at
		FROM payments WHERE order_ref = ?`, orderRef)
	return scanPayment(row)
}

func ListPaymentsBySession(db *sql.DB, sessionID string) ([]models.Payment, error) {
	rows, err := db.Query(`
		SELECT id, session_id, order_ref, amount, currency, status,
		       card_last4, card_brand, name_on_card, created_at, updated_at
		FROM payments WHERE session_id = ? ORDER BY created_at DESC`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []models.Payment
	for rows.Next() {
		p, err := scanPaymentRow(rows)
		if err != nil {
			return nil, err
		}
		payments = append(payments, *p)
	}
	return payments, nil
}

// Simulate payment authorisation — declines cards ending in 0000, approves everything else.
func Authorise(db *sql.DB, req models.AuthoriseRequest) (*models.Payment, error) {
	last4 := req.CardNumber
	if len(last4) >= 4 {
		last4 = last4[len(last4)-4:]
	}

	brand := detectBrand(req.CardNumber)
	orderRef := generateOrderRef()

	status := models.StatusAuthorised
	if last4 == "0000" {
		status = models.StatusDeclined
	}

	p := &models.Payment{
		SessionID:  req.SessionID,
		OrderRef:   orderRef,
		Amount:     req.Amount,
		Currency:   req.Currency,
		Status:     status,
		CardLast4:  last4,
		CardBrand:  brand,
		NameOnCard: req.NameOnCard,
	}

	id, err := CreatePayment(db, p)
	if err != nil {
		return nil, err
	}
	p.ID = id
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	return p, nil
}

func detectBrand(number string) string {
	number = strings.ReplaceAll(number, " ", "")
	if strings.HasPrefix(number, "4") {
		return "Visa"
	}
	if strings.HasPrefix(number, "5") || strings.HasPrefix(number, "2") {
		return "Mastercard"
	}
	if strings.HasPrefix(number, "34") || strings.HasPrefix(number, "37") {
		return "Amex"
	}
	return "Card"
}

func generateOrderRef() string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 8)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}
	return "ORD-" + string(b)
}

type scanner interface{ Scan(dest ...any) error }

func scanPayment(s scanner) (*models.Payment, error) {
	var p models.Payment
	err := s.Scan(&p.ID, &p.SessionID, &p.OrderRef, &p.Amount, &p.Currency,
		&p.Status, &p.CardLast4, &p.CardBrand, &p.NameOnCard, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}

func scanPaymentRow(rows *sql.Rows) (*models.Payment, error) {
	var p models.Payment
	err := rows.Scan(&p.ID, &p.SessionID, &p.OrderRef, &p.Amount, &p.Currency,
		&p.Status, &p.CardLast4, &p.CardBrand, &p.NameOnCard, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}
