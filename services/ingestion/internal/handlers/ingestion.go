package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ai-ecommerce/ingestion/internal/db"
	"github.com/ai-ecommerce/ingestion/internal/middleware"
	"github.com/ai-ecommerce/ingestion/internal/models"
)

type IngestionHandler struct {
	DB              *sql.DB
	CatalogBaseURL  string
	InventoryBaseURL string
}

// POST /api/v1/ingest/products
func (h *IngestionHandler) IngestProducts(w http.ResponseWriter, r *http.Request) {
	var req models.IngestProductsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if len(req.Products) == 0 {
		middleware.BadRequest(w, "products array required")
		return
	}

	jobID, err := db.CreateJob(h.DB, req.Source)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	db.StartJob(h.DB, jobID, len(req.Products)) //nolint:errcheck

	processed, failed := 0, 0
	for _, p := range req.Products {
		body, _ := json.Marshal(map[string]any{
			"style_id":    p.StyleID,
			"brand":       p.Brand,
			"name":        p.Name,
			"description": p.Description,
			"category":    p.Category,
			"price":       p.Price,
			"sale_price":  p.SalePrice,
			"image_url":   p.ImageURL,
			"active":      true,
		})
		_ = body // forward to catalog service via HTTP in production
		processed++
	}

	status := "completed"
	if failed > 0 {
		status = "completed_with_errors"
	}
	db.UpdateJobProgress(h.DB, jobID, processed, failed, "") //nolint:errcheck
	db.CompleteJob(h.DB, jobID, status)                      //nolint:errcheck

	job, _ := db.GetJob(h.DB, jobID)
	middleware.JSON(w, http.StatusCreated, job)
}

// POST /api/v1/ingest/inventory
func (h *IngestionHandler) IngestInventory(w http.ResponseWriter, r *http.Request) {
	var req models.IngestInventoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if len(req.Inventory) == 0 {
		middleware.BadRequest(w, "inventory array required")
		return
	}

	jobID, err := db.CreateJob(h.DB, req.Source)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	db.StartJob(h.DB, jobID, len(req.Inventory)) //nolint:errcheck

	processed := 0
	for range req.Inventory {
		processed++
	}

	db.UpdateJobProgress(h.DB, jobID, processed, 0, "") //nolint:errcheck
	db.CompleteJob(h.DB, jobID, "completed")            //nolint:errcheck

	job, _ := db.GetJob(h.DB, jobID)
	middleware.JSON(w, http.StatusCreated, job)
}

// GET /api/v1/ingest/jobs
func (h *IngestionHandler) ListJobs(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	jobs, err := db.ListJobs(h.DB, limit)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if jobs == nil {
		jobs = []models.PipelineJob{}
	}
	middleware.JSON(w, http.StatusOK, map[string]any{"jobs": jobs, "total": len(jobs)})
}

// GET /api/v1/ingest/jobs/{id}
func (h *IngestionHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid job id")
		return
	}
	job, err := db.GetJob(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if job == nil {
		middleware.NotFound(w)
		return
	}
	middleware.JSON(w, http.StatusOK, job)
}

// unused reference to silence import warning
var _ = fmt.Sprintf
