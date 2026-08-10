package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ai-ecommerce/payment/internal/db"
	"github.com/ai-ecommerce/payment/internal/middleware"
	"github.com/ai-ecommerce/payment/internal/models"
)

type PaymentHandler struct {
	DB *sql.DB
}

// POST /api/v1/payments/authorise
func (h *PaymentHandler) Authorise(w http.ResponseWriter, r *http.Request) {
	var req models.AuthoriseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if req.SessionID == "" {
		middleware.BadRequest(w, "session_id required")
		return
	}
	if req.Amount <= 0 {
		middleware.BadRequest(w, "amount must be greater than 0")
		return
	}
	if len(req.CardNumber) < 13 {
		middleware.BadRequest(w, "invalid card number")
		return
	}
	if req.CVV == "" || req.ExpiryMonth == "" || req.ExpiryYear == "" {
		middleware.BadRequest(w, "card details incomplete")
		return
	}
	if req.Currency == "" {
		req.Currency = "USD"
	}

	payment, err := db.Authorise(h.DB, req)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}

	resp := models.AuthoriseResponse{
		Payment: payment,
		Success: payment.Status == models.StatusAuthorised,
	}
	if resp.Success {
		resp.Message = "Payment authorised"
	} else {
		resp.Message = "Payment declined — please check your card details"
	}

	middleware.JSON(w, http.StatusOK, resp)
}

// GET /api/v1/payments/{id}
func (h *PaymentHandler) GetPayment(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid payment id")
		return
	}
	payment, err := db.GetPayment(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if payment == nil {
		middleware.NotFound(w)
		return
	}
	middleware.JSON(w, http.StatusOK, payment)
}

// GET /api/v1/payments?session_id=
func (h *PaymentHandler) ListPayments(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		middleware.BadRequest(w, "session_id required")
		return
	}
	payments, err := db.ListPaymentsBySession(h.DB, sessionID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if payments == nil {
		payments = []models.Payment{}
	}
	middleware.JSON(w, http.StatusOK, map[string]any{"payments": payments, "total": len(payments)})
}
