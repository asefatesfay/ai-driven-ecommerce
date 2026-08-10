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

// GetCart returns the cart for a user or session.
// @Summary Get cart
// @Description Get or create a cart identified by user_id or session_id
// @Tags cart
// @Produce json
// @Param user_id query int false "User ID"
// @Param session_id query string false "Cart session ID"
// @Success 200 {object} models.Cart
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /cart [get]
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

// AddItem adds an item to the cart.
// @Summary Add item to cart
// @Description Add a product variant to a cart identified by user_id or session_id
// @Tags cart
// @Accept json
// @Produce json
// @Param user_id query int false "User ID"
// @Param session_id query string false "Cart session ID"
// @Param body body models.AddToCartRequest true "Item to add"
// @Success 200 {object} models.Cart
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /cart/items [post]
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

// UpdateItem updates the quantity of a cart item.
// @Summary Update cart item
// @Description Update the quantity of a specific item in the cart
// @Tags cart
// @Accept json
// @Produce json
// @Param itemId path int true "Cart Item ID"
// @Param user_id query int false "User ID"
// @Param session_id query string false "Cart session ID"
// @Param body body models.UpdateCartItemRequest true "Updated quantity"
// @Success 200 {object} models.Cart
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /cart/items/{itemId} [put]
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

// RemoveItem removes an item from the cart.
// @Summary Remove cart item
// @Description Remove a specific item from the cart
// @Tags cart
// @Produce json
// @Param itemId path int true "Cart Item ID"
// @Param user_id query int false "User ID"
// @Param session_id query string false "Cart session ID"
// @Success 200 {object} models.Cart
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /cart/items/{itemId} [delete]
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

// ClearCart removes all items from a cart.
// @Summary Clear cart
// @Description Remove all items from a cart identified by user_id or session_id
// @Tags cart
// @Produce json
// @Param user_id query int false "User ID"
// @Param session_id query string false "Cart session ID"
// @Success 200 {object} map[string]string
// @Failure 500 {object} middleware.APIError
// @Router /cart [delete]
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
