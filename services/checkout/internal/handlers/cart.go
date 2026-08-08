package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ai-ecommerce/checkout/internal/db"
	"github.com/ai-ecommerce/checkout/internal/middleware"
	"github.com/ai-ecommerce/checkout/internal/models"
)

type CartHandler struct {
	DB *sql.DB
}

// GET /api/v1/cart?user_id=&session_id=
func (h *CartHandler) GetCart(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	userID, _ := strconv.ParseInt(q.Get("user_id"), 10, 64)
	sessionID := q.Get("session_id")

	if userID == 0 && sessionID == "" {
		middleware.BadRequest(w, "user_id or session_id required")
		return
	}

	cart, err := db.GetOrCreateCart(h.DB, userID, sessionID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, cart)
}

// POST /api/v1/cart/items?user_id=&session_id=
func (h *CartHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	userID, _ := strconv.ParseInt(q.Get("user_id"), 10, 64)
	sessionID := q.Get("session_id")

	var req models.AddToCartRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if req.ProductID == 0 || req.Quantity < 1 {
		middleware.BadRequest(w, "product_id and quantity >= 1 required")
		return
	}

	cart, err := db.GetOrCreateCart(h.DB, userID, sessionID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if err := db.AddToCart(h.DB, cart.ID, req); err != nil {
		middleware.InternalError(w, err)
		return
	}
	updatedCart, _ := db.GetOrCreateCart(h.DB, userID, sessionID)
	middleware.JSON(w, http.StatusOK, updatedCart)
}

// PUT /api/v1/cart/items/{itemId}
func (h *CartHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	itemID, err := strconv.ParseInt(chi.URLParam(r, "itemId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid item id")
		return
	}
	q := r.URL.Query()
	userID, _ := strconv.ParseInt(q.Get("user_id"), 10, 64)
	sessionID := q.Get("session_id")

	var req models.UpdateCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}

	cart, err := db.GetOrCreateCart(h.DB, userID, sessionID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if err := db.UpdateCartItem(h.DB, cart.ID, itemID, req.Quantity); err != nil {
		middleware.InternalError(w, err)
		return
	}
	updatedCart, _ := db.GetOrCreateCart(h.DB, userID, sessionID)
	middleware.JSON(w, http.StatusOK, updatedCart)
}

// DELETE /api/v1/cart/items/{itemId}
func (h *CartHandler) RemoveItem(w http.ResponseWriter, r *http.Request) {
	itemID, err := strconv.ParseInt(chi.URLParam(r, "itemId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid item id")
		return
	}
	q := r.URL.Query()
	userID, _ := strconv.ParseInt(q.Get("user_id"), 10, 64)
	sessionID := q.Get("session_id")

	cart, err := db.GetOrCreateCart(h.DB, userID, sessionID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	db.RemoveFromCart(h.DB, cart.ID, itemID) //nolint:errcheck
	updatedCart, _ := db.GetOrCreateCart(h.DB, userID, sessionID)
	middleware.JSON(w, http.StatusOK, updatedCart)
}

// DELETE /api/v1/cart?user_id=&session_id=
func (h *CartHandler) ClearCart(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	userID, _ := strconv.ParseInt(q.Get("user_id"), 10, 64)
	sessionID := q.Get("session_id")

	cart, err := db.GetOrCreateCart(h.DB, userID, sessionID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	db.ClearCart(h.DB, cart.ID) //nolint:errcheck
	middleware.JSON(w, http.StatusOK, map[string]string{"status": "cleared"})
}
