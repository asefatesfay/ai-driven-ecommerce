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

type WishlistHandler struct {
	DB *sql.DB
}

// GET /api/v1/wishlist/{userId}
func (h *WishlistHandler) GetWishlist(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	items, err := db.GetWishlist(h.DB, userID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if items == nil {
		items = []models.WishlistItem{}
	}
	middleware.JSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

// POST /api/v1/wishlist/{userId}
func (h *WishlistHandler) AddToWishlist(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	var req models.AddToWishlistRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if req.ProductID == 0 {
		middleware.BadRequest(w, "product_id required")
		return
	}
	if err := db.AddToWishlist(h.DB, userID, req); err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusCreated, map[string]string{"status": "added"})
}

// DELETE /api/v1/wishlist/{userId}/{productId}
func (h *WishlistHandler) RemoveFromWishlist(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	productID, err := strconv.ParseInt(chi.URLParam(r, "productId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid product id")
		return
	}
	db.RemoveFromWishlist(h.DB, userID, productID) //nolint:errcheck
	middleware.JSON(w, http.StatusOK, map[string]string{"status": "removed"})
}
