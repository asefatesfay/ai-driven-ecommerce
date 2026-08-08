package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ai-ecommerce/order/internal/db"
	"github.com/ai-ecommerce/order/internal/middleware"
	"github.com/ai-ecommerce/order/internal/models"
)

type OrderHandler struct {
	DB *sql.DB
}

// POST /api/v1/orders
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var req models.CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if req.UserID == 0 || len(req.Items) == 0 {
		middleware.BadRequest(w, "user_id and items are required")
		return
	}

	order, err := db.CreateOrder(h.DB, &req)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusCreated, order)
}

// GET /api/v1/orders/{id}
func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid order id")
		return
	}
	order, err := db.GetOrder(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if order == nil {
		middleware.NotFound(w)
		return
	}
	middleware.JSON(w, http.StatusOK, order)
}

// GET /api/v1/orders?user_id=&status=&page=&page_size=
func (h *OrderHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	userID, _ := strconv.ParseInt(q.Get("user_id"), 10, 64)
	if userID == 0 {
		middleware.BadRequest(w, "user_id is required")
		return
	}

	params := models.OrderListParams{
		UserID:   userID,
		Status:   models.OrderStatus(q.Get("status")),
		Page:     1,
		PageSize: 20,
	}
	if v, err := strconv.Atoi(q.Get("page")); err == nil && v > 0 {
		params.Page = v
	}
	if v, err := strconv.Atoi(q.Get("page_size")); err == nil && v > 0 {
		params.PageSize = v
	}

	result, err := db.ListOrdersByUser(h.DB, params)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, result)
}

// PUT /api/v1/orders/{id}/status
func (h *OrderHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid order id")
		return
	}
	var req models.UpdateOrderStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if err := db.UpdateOrderStatus(h.DB, id, req); err != nil {
		middleware.InternalError(w, err)
		return
	}
	order, _ := db.GetOrder(h.DB, id)
	middleware.JSON(w, http.StatusOK, order)
}
