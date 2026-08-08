package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/ai-ecommerce/editorial/internal/db"
	"github.com/ai-ecommerce/editorial/internal/middleware"
	"github.com/ai-ecommerce/editorial/internal/models"
)

type DraftHandler struct {
	DB             *sql.DB
	CoreURL        string
	CatalogURL     string
	client         *http.Client
}

func NewDraftHandler(database *sql.DB, coreURL, catalogURL string) *DraftHandler {
	return &DraftHandler{
		DB:         database,
		CoreURL:    coreURL,
		CatalogURL: catalogURL,
		client:     &http.Client{Timeout: 45 * time.Second},
	}
}

// GET /api/v1/drafts?status=&style_id=&page=&page_size=
func (h *DraftHandler) ListDrafts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	pageSize, _ := strconv.Atoi(q.Get("page_size"))
	result, err := db.ListDrafts(h.DB,
		models.DraftStatus(q.Get("status")),
		q.Get("style_id"),
		page, pageSize,
	)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, result)
}

// GET /api/v1/drafts/{id}
func (h *DraftHandler) GetDraft(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid draft id")
		return
	}
	draft, err := db.GetDraft(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if draft == nil {
		middleware.NotFound(w)
		return
	}
	middleware.JSON(w, http.StatusOK, draft)
}

// POST /api/v1/drafts/generate — calls Python core, saves all variants as drafts
func (h *DraftHandler) Generate(w http.ResponseWriter, r *http.Request) {
	var req models.GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if req.StyleID == "" {
		middleware.BadRequest(w, "style_id required")
		return
	}
	if req.NumVariants == 0 {
		req.NumVariants = 3
	}
	if req.MaxWords == 0 {
		req.MaxWords = 60
	}

	// Fetch product details from catalog service
	product, err := h.fetchProduct(req.StyleID)
	if err != nil {
		middleware.InternalError(w, fmt.Errorf("fetch product: %w", err))
		return
	}

	// Build core request
	corePayload := map[string]any{
		"product":      product,
		"attribution":  req.Attribution,
		"themes":       req.Themes,
		"price_range":  req.PriceRange,
		"max_words":    req.MaxWords,
		"num_variants": req.NumVariants,
	}
	body, _ := json.Marshal(corePayload)

	resp, err := h.client.Post(h.CoreURL+"/api/v1/generate", "application/json", bytes.NewReader(body))
	if err != nil {
		middleware.InternalError(w, fmt.Errorf("core request: %w", err))
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		middleware.InternalError(w, fmt.Errorf("core error %d: %s", resp.StatusCode, respBody))
		return
	}

	var coreResp models.GenerateCoreResponse
	if err := json.Unmarshal(respBody, &coreResp); err != nil {
		middleware.InternalError(w, fmt.Errorf("parse core response: %w", err))
		return
	}

	// Save each variant as a separate draft
	productName, _ := product["name"].(string)
	brand, _ := product["brand"].(string)

	var savedDrafts []models.Draft
	for _, v := range coreResp.Variants {
		draft := &models.Draft{
			StyleID:     req.StyleID,
			ProductName: productName,
			Brand:       brand,
			Attribution: v.Attribution,
			Headline:    v.Headline,
			Body:        v.Body,
			ToneNotes:   v.ToneNotes,
			Themes:      req.Themes,
			PriceRange:  req.PriceRange,
			GeneratedBy: "ai",
		}
		id, err := db.CreateDraft(h.DB, draft)
		if err != nil {
			middleware.InternalError(w, err)
			return
		}
		saved, _ := db.GetDraft(h.DB, id)
		if saved != nil {
			savedDrafts = append(savedDrafts, *saved)
		}
	}

	middleware.JSON(w, http.StatusCreated, map[string]any{
		"style_id": req.StyleID,
		"drafts":   savedDrafts,
		"total":    len(savedDrafts),
	})
}

// PUT /api/v1/drafts/{id} — inline edit headline/body
func (h *DraftHandler) UpdateDraft(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid draft id")
		return
	}
	var req models.UpdateDraftRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if err := db.UpdateDraftContent(h.DB, id, req); err != nil {
		middleware.InternalError(w, err)
		return
	}
	draft, _ := db.GetDraft(h.DB, id)
	middleware.JSON(w, http.StatusOK, draft)
}

// POST /api/v1/drafts/{id}/approve
func (h *DraftHandler) ApproveDraft(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid draft id")
		return
	}
	var req models.TransitionRequest
	json.NewDecoder(r.Body).Decode(&req) //nolint:errcheck

	if err := db.ApproveDraft(h.DB, id, req.ReviewedBy); err != nil {
		middleware.Conflict(w, err.Error())
		return
	}
	draft, _ := db.GetDraft(h.DB, id)
	middleware.JSON(w, http.StatusOK, draft)
}

// POST /api/v1/drafts/{id}/publish — writes to catalog editorial table
func (h *DraftHandler) PublishDraft(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid draft id")
		return
	}
	var req models.TransitionRequest
	json.NewDecoder(r.Body).Decode(&req) //nolint:errcheck

	draft, err := db.PublishDraft(h.DB, id, req.PublishedBy)
	if err != nil {
		middleware.Conflict(w, err.Error())
		return
	}

	// Push to catalog service
	if err := h.pushToCatalog(draft); err != nil {
		// Non-fatal: draft is already published in editorial DB
		// Return the draft with a warning
		middleware.JSON(w, http.StatusOK, map[string]any{
			"draft":   draft,
			"warning": fmt.Sprintf("published locally but catalog sync failed: %v", err),
		})
		return
	}

	middleware.JSON(w, http.StatusOK, draft)
}

// POST /api/v1/drafts/{id}/archive
func (h *DraftHandler) ArchiveDraft(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid draft id")
		return
	}
	if err := db.ArchiveDraft(h.DB, id); err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, map[string]string{"status": "archived"})
}

// ── Internal helpers ─────────────────────────────────────────────────────────

func (h *DraftHandler) fetchProduct(styleID string) (map[string]any, error) {
	resp, err := h.client.Get(h.CatalogURL + "/api/v1/products/style/" + styleID)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var product map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&product); err != nil {
		return nil, err
	}
	return product, nil
}

func (h *DraftHandler) pushToCatalog(draft *models.Draft) error {
	themes := make([]string, len(draft.Themes))
	copy(themes, draft.Themes)

	payload := map[string]any{
		"editorial_headline": draft.Headline,
		"editorial_copy":     draft.Body,
		"attribution":        string(draft.Attribution),
		"filter_recipient":   []string{},
		"filter_theme":       themes,
		"filter_price":       draft.PriceRange,
		"active":             true,
	}
	body, _ := json.Marshal(payload)

	url := fmt.Sprintf("%s/api/v1/editorial/products/%s", h.CatalogURL, draft.StyleID)
	req, err := http.NewRequest(http.MethodPut, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := h.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("catalog returned %d: %s", resp.StatusCode, b)
	}
	return nil
}
