package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/nordstrom/gift-edit/api/internal/db"
	"github.com/nordstrom/gift-edit/api/internal/middleware"
	"github.com/nordstrom/gift-edit/api/internal/models"
)

type CatalogHandler struct {
	DB *sql.DB
}

// GET /api/products
func (h *CatalogHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	params := models.ProductListParams{
		Category:  q.Get("category"),
		Recipient: q.Get("recipient"),
		Search:    q.Get("search"),
		SortBy:    q.Get("sort"),
	}

	if v := q.Get("min_price"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			params.MinPrice = &f
		}
	}
	if v := q.Get("max_price"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			params.MaxPrice = &f
		}
	}
	if q.Get("on_sale") == "true" {
		t := true
		params.OnSale = &t
	}
	if v := q.Get("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			params.Page = n
		}
	}
	if v := q.Get("page_size"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			params.PageSize = n
		}
	}

	result, err := db.ListProducts(h.DB, params)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, result)
}

// GET /api/products/{id}
func (h *CatalogHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid product id")
		return
	}

	product, err := db.GetProduct(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if product == nil {
		middleware.NotFound(w)
		return
	}
	middleware.JSON(w, http.StatusOK, product)
}

// GET /api/products/style/{styleId}
func (h *CatalogHandler) GetProductByStyle(w http.ResponseWriter, r *http.Request) {
	styleID := chi.URLParam(r, "styleId")
	product, err := db.GetProductByStyleID(h.DB, styleID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if product == nil {
		middleware.NotFound(w)
		return
	}
	middleware.JSON(w, http.StatusOK, product)
}

// POST /api/products
func (h *CatalogHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if p.StyleID == "" || p.Brand == "" || p.Name == "" {
		middleware.BadRequest(w, "style_id, brand and name are required")
		return
	}
	p.Active = true

	id, err := db.CreateProduct(h.DB, &p)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	product, _ := db.GetProduct(h.DB, id)
	middleware.JSON(w, http.StatusCreated, product)
}

// PUT /api/products/{id}
func (h *CatalogHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid product id")
		return
	}

	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if err := db.UpdateProduct(h.DB, id, &p); err != nil {
		middleware.InternalError(w, err)
		return
	}
	product, _ := db.GetProduct(h.DB, id)
	middleware.JSON(w, http.StatusOK, product)
}

// GET /api/editorial
func (h *CatalogHandler) ListEditorial(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := models.EditorialListParams{
		Recipient: q.Get("recipient"),
		Theme:     q.Get("theme"),
		Price:     q.Get("price"),
	}

	items, err := db.ListEditorialProducts(h.DB, params)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if items == nil {
		items = []models.EditorialProduct{}
	}
	middleware.JSON(w, http.StatusOK, map[string]any{
		"editorial_products": items,
		"total":              len(items),
	})
}
