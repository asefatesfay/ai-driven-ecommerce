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

// GetWishlist returns all wishlist items for a user.
// @Summary Get wishlist
// @Description Get all wishlist items for a user by their numeric user ID
// @Tags wishlist
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /wishlist/{userId} [get]
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

// AddToWishlist adds a product to a user's wishlist.
// @Summary Add to wishlist
// @Description Add a product to the specified user's wishlist
// @Tags wishlist
// @Accept json
// @Produce json
// @Param userId path int true "User ID"
// @Param body body models.AddToWishlistRequest true "Product to add"
// @Success 201 {object} map[string]string
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /wishlist/{userId} [post]
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

// RemoveFromWishlist removes a product from a user's wishlist.
// @Summary Remove from wishlist
// @Description Remove a product from the specified user's wishlist
// @Tags wishlist
// @Produce json
// @Param userId path int true "User ID"
// @Param productId path int true "Product ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} middleware.APIError
// @Router /wishlist/{userId}/{productId} [delete]
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
