package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ai-ecommerce/catalog/internal/db"
	"github.com/ai-ecommerce/catalog/internal/middleware"
	"github.com/ai-ecommerce/catalog/internal/models"
)

type CatalogHandler struct {
	DB *sql.DB
}

// ListProducts returns a paginated list of products.
// @Summary List products
// @Description Get paginated products with optional filters
// @Tags products
// @Produce json
// @Param category query string false "Filter by category"
// @Param recipient query string false "Filter by recipient"
// @Param search query string false "Search by name or brand"
// @Param sort query string false "Sort order: price_asc|price_desc|rating|newest"
// @Param min_price query number false "Minimum price filter"
// @Param max_price query number false "Maximum price filter"
// @Param on_sale query bool false "Filter to sale items only"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Items per page" default(8)
// @Success 200 {object} models.ProductListResult
// @Failure 500 {object} middleware.APIError
// @Router /products [get]
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

// GetProduct returns a product by ID.
// @Summary Get product
// @Description Get a single product by its numeric ID
// @Tags products
// @Produce json
// @Param id path int true "Product ID"
// @Success 200 {object} models.Product
// @Failure 400 {object} middleware.APIError
// @Failure 404 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /products/{id} [get]
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

// GetProductByStyle returns a product by style ID.
// @Summary Get product by style ID
// @Description Get a single product by its style ID string
// @Tags products
// @Produce json
// @Param styleId path string true "Style ID"
// @Success 200 {object} models.Product
// @Failure 404 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /products/style/{styleId} [get]
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

// CreateProduct creates a new product.
// @Summary Create product
// @Description Create a new product in the catalog
// @Tags products
// @Accept json
// @Produce json
// @Param body body models.Product true "Product to create"
// @Success 201 {object} models.Product
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /products [post]
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

// UpdateProduct updates an existing product.
// @Summary Update product
// @Description Update fields of an existing product by ID
// @Tags products
// @Accept json
// @Produce json
// @Param id path int true "Product ID"
// @Param body body models.Product true "Updated product fields"
// @Success 200 {object} models.Product
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /products/{id} [put]
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

// UpsertEditorial upserts editorial metadata for a product style.
// @Summary Upsert editorial product
// @Description Create or update editorial copy for a product style
// @Tags editorial
// @Accept json
// @Produce json
// @Param styleId path string true "Style ID"
// @Param body body models.UpsertEditorialRequest true "Editorial data"
// @Success 200 {object} map[string]string
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /editorial/products/{styleId} [put]
func (h *CatalogHandler) UpsertEditorial(w http.ResponseWriter, r *http.Request) {
	styleID := chi.URLParam(r, "styleId")
	var req models.UpsertEditorialRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if err := db.UpsertEditorialProduct(h.DB, styleID, req); err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// ListEditorial returns editorial products with optional filters.
// @Summary List editorial products
// @Description Get editorial (gift-edit) products with optional recipient/theme/price filters
// @Tags editorial
// @Produce json
// @Param recipient query string false "Filter by recipient"
// @Param theme query string false "Filter by theme"
// @Param price query string false "Filter by price range"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} middleware.APIError
// @Router /editorial [get]
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
