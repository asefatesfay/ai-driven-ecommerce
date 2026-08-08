package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/ai-ecommerce/editorial/internal/models"
)

func CreateDraft(db *sql.DB, draft *models.Draft) (int64, error) {
	themesJSON, _ := json.Marshal(draft.Themes)
	res, err := db.Exec(`
		INSERT INTO drafts
		    (style_id, product_name, brand, attribution, headline, body,
		     tone_notes, status, themes, price_range, generated_by)
		VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		draft.StyleID, draft.ProductName, draft.Brand,
		draft.Attribution, draft.Headline, draft.Body,
		draft.ToneNotes, models.StatusDraft,
		string(themesJSON), draft.PriceRange, draft.GeneratedBy,
	)
	if err != nil {
		return 0, fmt.Errorf("insert draft: %w", err)
	}
	return res.LastInsertId()
}

func GetDraft(db *sql.DB, id int64) (*models.Draft, error) {
	row := db.QueryRow(`
		SELECT id, style_id, product_name, brand, attribution, headline, body,
		       tone_notes, status, themes, price_range, generated_by,
		       reviewed_by, published_by, published_at, created_at, updated_at
		FROM drafts WHERE id = ?`, id)
	return scanDraft(row)
}

func ListDrafts(db *sql.DB, status models.DraftStatus, styleID string, page, pageSize int) (*models.DraftListResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	where := []string{"1=1"}
	args := []any{}
	if status != "" {
		where = append(where, "status = ?")
		args = append(args, status)
	}
	if styleID != "" {
		where = append(where, "style_id = ?")
		args = append(args, styleID)
	}
	clause := "WHERE " + strings.Join(where, " AND ")

	var total int
	db.QueryRow("SELECT COUNT(*) FROM drafts "+clause, args...).Scan(&total) //nolint:errcheck

	offset := (page - 1) * pageSize
	rows, err := db.Query(
		"SELECT id, style_id, product_name, brand, attribution, headline, body, "+
			"tone_notes, status, themes, price_range, generated_by, "+
			"reviewed_by, published_by, published_at, created_at, updated_at "+
			"FROM drafts "+clause+" ORDER BY updated_at DESC LIMIT ? OFFSET ?",
		append(args, pageSize, offset)...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var drafts []models.Draft
	for rows.Next() {
		d, err := scanDraftRow(rows)
		if err != nil {
			return nil, err
		}
		drafts = append(drafts, *d)
	}
	if drafts == nil {
		drafts = []models.Draft{}
	}

	totalPages := (total + pageSize - 1) / pageSize
	return &models.DraftListResult{
		Drafts: drafts, Total: total,
		Page: page, PageSize: pageSize, TotalPages: totalPages,
	}, nil
}

func UpdateDraftContent(db *sql.DB, id int64, req models.UpdateDraftRequest) error {
	_, err := db.Exec(
		"UPDATE drafts SET headline=?, body=?, updated_at=datetime('now') WHERE id=?",
		req.Headline, req.Body, id,
	)
	return err
}

// Approve transitions draft → approved.
func ApproveDraft(db *sql.DB, id int64, reviewedBy string) error {
	res, err := db.Exec(
		"UPDATE drafts SET status='approved', reviewed_by=?, updated_at=datetime('now') WHERE id=? AND status='draft'",
		reviewedBy, id,
	)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fmt.Errorf("draft %d not in draft status", id)
	}
	return nil
}

// Publish transitions approved → published and returns the published draft.
func PublishDraft(db *sql.DB, id int64, publishedBy string) (*models.Draft, error) {
	now := time.Now()
	res, err := db.Exec(
		"UPDATE drafts SET status='published', published_by=?, published_at=?, updated_at=datetime('now') WHERE id=? AND status='approved'",
		publishedBy, now, id,
	)
	if err != nil {
		return nil, err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, fmt.Errorf("draft %d not in approved status", id)
	}
	return GetDraft(db, id)
}

// Archive moves any non-published draft to archived.
func ArchiveDraft(db *sql.DB, id int64) error {
	_, err := db.Exec(
		"UPDATE drafts SET status='archived', updated_at=datetime('now') WHERE id=? AND status != 'published'",
		id,
	)
	return err
}

// ── Scanning helpers ─────────────────────────────────────────────────────────

type scanner interface{ Scan(dest ...any) error }

func scanDraft(s scanner) (*models.Draft, error) {
	var d models.Draft
	var themesJSON string
	var reviewedBy, publishedBy sql.NullString
	var publishedAt sql.NullTime

	err := s.Scan(
		&d.ID, &d.StyleID, &d.ProductName, &d.Brand,
		&d.Attribution, &d.Headline, &d.Body, &d.ToneNotes,
		&d.Status, &themesJSON, &d.PriceRange, &d.GeneratedBy,
		&reviewedBy, &publishedBy, &publishedAt,
		&d.CreatedAt, &d.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	json.Unmarshal([]byte(themesJSON), &d.Themes) //nolint:errcheck
	if reviewedBy.Valid {
		d.ReviewedBy = reviewedBy.String
	}
	if publishedBy.Valid {
		d.PublishedBy = publishedBy.String
	}
	if publishedAt.Valid {
		d.PublishedAt = &publishedAt.Time
	}
	return &d, nil
}

func scanDraftRow(rows *sql.Rows) (*models.Draft, error) {
	var d models.Draft
	var themesJSON string
	var reviewedBy, publishedBy sql.NullString
	var publishedAt sql.NullTime

	err := rows.Scan(
		&d.ID, &d.StyleID, &d.ProductName, &d.Brand,
		&d.Attribution, &d.Headline, &d.Body, &d.ToneNotes,
		&d.Status, &themesJSON, &d.PriceRange, &d.GeneratedBy,
		&reviewedBy, &publishedBy, &publishedAt,
		&d.CreatedAt, &d.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	json.Unmarshal([]byte(themesJSON), &d.Themes) //nolint:errcheck
	if reviewedBy.Valid {
		d.ReviewedBy = reviewedBy.String
	}
	if publishedBy.Valid {
		d.PublishedBy = publishedBy.String
	}
	if publishedAt.Valid {
		d.PublishedAt = &publishedAt.Time
	}
	return &d, nil
}
