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

// CreateOrder creates a new order.
// @Summary Create order
// @Description Create a new order for a user with line items and shipping address
// @Tags orders
// @Accept json
// @Produce json
// @Param body body models.CreateOrderRequest true "Order creation request"
// @Success 201 {object} models.Order
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /orders [post]
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

// GetOrder returns an order by ID.
// @Summary Get order
// @Description Get a single order by its numeric ID
// @Tags orders
// @Produce json
// @Param id path int true "Order ID"
// @Success 200 {object} models.Order
// @Failure 400 {object} middleware.APIError
// @Failure 404 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /orders/{id} [get]
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

// ListOrders returns a paginated list of orders for a user.
// @Summary List orders
// @Description Get paginated orders for a user with optional status filter
// @Tags orders
// @Produce json
// @Param user_id query int true "User ID"
// @Param status query string false "Filter by order status"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Items per page" default(20)
// @Success 200 {object} models.OrderListResult
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /orders [get]
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

// UpdateOrderStatus updates the status of an order.
// @Summary Update order status
// @Description Update the status and optional tracking number for an order
// @Tags orders
// @Accept json
// @Produce json
// @Param id path int true "Order ID"
// @Param body body models.UpdateOrderStatusRequest true "Status update"
// @Success 200 {object} models.Order
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /orders/{id}/status [put]
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
