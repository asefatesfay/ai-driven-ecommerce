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

// GET /api/inventory/{productId}
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

// GET /api/inventory?style_ids=ABC,DEF,GHI
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

// POST /api/inventory/adjust
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

// POST /api/inventory/sync — triggers the editorial active-flag sync
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
