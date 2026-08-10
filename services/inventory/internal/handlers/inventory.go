package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/ai-ecommerce/inventory/internal/db"
	"github.com/ai-ecommerce/inventory/internal/middleware"
	"github.com/ai-ecommerce/inventory/internal/models"
)

type InventoryHandler struct {
	DB *sql.DB
}

// GetInventory returns inventory for a single product.
// @Summary Get product inventory
// @Description Get inventory variants for a product by its numeric product ID
// @Tags inventory
// @Produce json
// @Param productId path int true "Product ID"
// @Success 200 {object} models.ProductInventory
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /inventory/{productId} [get]
func (h *InventoryHandler) GetInventory(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "productId")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid product id")
		return
	}

	inv, err := db.GetProductInventory(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, inv)
}

// BulkGetInventory returns inventory for multiple products by style IDs.
// @Summary Bulk get inventory by style IDs
// @Description Get inventory for multiple products using a comma-separated list of style IDs
// @Tags inventory
// @Produce json
// @Param style_ids query string true "Comma-separated style IDs"
// @Success 200 {object} map[string]models.ProductInventory
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /inventory [get]
func (h *InventoryHandler) BulkGetInventory(w http.ResponseWriter, r *http.Request) {
	raw := r.URL.Query().Get("style_ids")
	if raw == "" {
		middleware.BadRequest(w, "style_ids query param required")
		return
	}
	styleIDs := strings.Split(raw, ",")
	for i := range styleIDs {
		styleIDs[i] = strings.TrimSpace(styleIDs[i])
	}

	result, err := db.GetInventoryByStyleIDs(h.DB, styleIDs)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, result)
}

// AdjustInventory adjusts the quantity of a product variant.
// @Summary Adjust inventory
// @Description Apply a delta (positive=restock, negative=sold/reserve) to a product variant
// @Tags inventory
// @Accept json
// @Produce json
// @Param body body models.InventoryAdjustment true "Inventory adjustment"
// @Success 200 {object} models.ProductInventory
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /inventory/adjust [post]
func (h *InventoryHandler) AdjustInventory(w http.ResponseWriter, r *http.Request) {
	var adj models.InventoryAdjustment
	if err := json.NewDecoder(r.Body).Decode(&adj); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if adj.ProductID == 0 {
		middleware.BadRequest(w, "product_id is required")
		return
	}

	if err := db.AdjustInventory(h.DB, adj); err != nil {
		middleware.InternalError(w, err)
		return
	}

	inv, err := db.GetProductInventory(h.DB, adj.ProductID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, inv)
}

// SyncInventory triggers the editorial active-flag inventory sync.
// @Summary Sync inventory
// @Description Trigger the editorial active-flag sync based on current stock levels
// @Tags inventory
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} middleware.APIError
// @Router /inventory/sync [post]
func (h *InventoryHandler) SyncInventory(w http.ResponseWriter, r *http.Request) {
	deactivated, reactivated, err := db.SyncInventory(h.DB)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, map[string]any{
		"deactivated": deactivated,
		"reactivated": reactivated,
	})
}
