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

// ListDrafts returns a paginated list of editorial drafts.
// @Summary List drafts
// @Description Get paginated editorial copy drafts with optional status and style ID filters
// @Tags drafts
// @Produce json
// @Param status query string false "Filter by draft status"
// @Param style_id query string false "Filter by product style ID"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Items per page" default(20)
// @Success 200 {object} models.DraftListResult
// @Failure 500 {object} middleware.APIError
// @Router /drafts [get]
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

// GetDraft returns an editorial draft by ID.
// @Summary Get draft
// @Description Get a single editorial draft by its numeric ID
// @Tags drafts
// @Produce json
// @Param id path int true "Draft ID"
// @Success 200 {object} models.Draft
// @Failure 400 {object} middleware.APIError
// @Failure 404 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /drafts/{id} [get]
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

// Generate generates editorial copy variants using the AI core.
// @Summary Generate editorial copy
// @Description Call the AI core to generate copy variants for a product, then save as drafts
// @Tags drafts
// @Accept json
// @Produce json
// @Param body body models.GenerateRequest true "Generate request"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /drafts/generate [post]
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

// UpdateDraft updates the headline and body of a draft.
// @Summary Update draft
// @Description Update the headline and body of an existing editorial draft
// @Tags drafts
// @Accept json
// @Produce json
// @Param id path int true "Draft ID"
// @Param body body models.UpdateDraftRequest true "Updated content"
// @Success 200 {object} models.Draft
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /drafts/{id} [put]
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

// ApproveDraft approves an editorial draft.
// @Summary Approve draft
// @Description Transition a draft to the approved state
// @Tags drafts
// @Accept json
// @Produce json
// @Param id path int true "Draft ID"
// @Param body body models.TransitionRequest false "Reviewer information"
// @Success 200 {object} models.Draft
// @Failure 400 {object} middleware.APIError
// @Failure 409 {object} middleware.APIError
// @Router /drafts/{id}/approve [post]
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

// PublishDraft publishes a draft and syncs it to the catalog service.
// @Summary Publish draft
// @Description Transition a draft to published and push the editorial copy to the catalog service
// @Tags drafts
// @Accept json
// @Produce json
// @Param id path int true "Draft ID"
// @Param body body models.TransitionRequest false "Publisher information"
// @Success 200 {object} models.Draft
// @Failure 400 {object} middleware.APIError
// @Failure 409 {object} middleware.APIError
// @Router /drafts/{id}/publish [post]
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

// ArchiveDraft archives an editorial draft.
// @Summary Archive draft
// @Description Move a draft to the archived state
// @Tags drafts
// @Produce json
// @Param id path int true "Draft ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /drafts/{id}/archive [post]
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
