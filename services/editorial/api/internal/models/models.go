package models

import "time"

type DraftStatus string

const (
	StatusDraft     DraftStatus = "draft"
	StatusApproved  DraftStatus = "approved"
	StatusPublished DraftStatus = "published"
	StatusArchived  DraftStatus = "archived"
)

type Attribution string

const (
	AttrFashionOffice  Attribution = "fashion-office"
	AttrBuyer          Attribution = "buyer"
	AttrStylist        Attribution = "stylist"
	AttrCustomerLoved  Attribution = "customer-loved"
)

// Draft is a single editorial copy draft for a product.
type Draft struct {
	ID            int64       `json:"id"`
	StyleID       string      `json:"style_id"`
	ProductName   string      `json:"product_name"`
	Brand         string      `json:"brand"`
	Attribution   Attribution `json:"attribution"`
	Headline      string      `json:"headline"`
	Body          string      `json:"body"`
	ToneNotes     string      `json:"tone_notes,omitempty"`
	Status        DraftStatus `json:"status"`
	Themes        []string    `json:"themes"`
	PriceRange    string      `json:"price_range"`
	GeneratedBy   string      `json:"generated_by"` // "ai" | "human"
	ReviewedBy    string      `json:"reviewed_by,omitempty"`
	PublishedBy   string      `json:"published_by,omitempty"`
	PublishedAt   *time.Time  `json:"published_at,omitempty"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
}

// GenerateRequest sent from the UI → Go API → Python core.
type GenerateRequest struct {
	StyleID          string      `json:"style_id"`
	Attribution      Attribution `json:"attribution"`
	Themes           []string    `json:"themes"`
	PriceRange       string      `json:"price_range"`
	MaxWords         int         `json:"max_words"`
	NumVariants      int         `json:"num_variants"`
	Feedback         string      `json:"feedback,omitempty"`
	PreviousHeadline string      `json:"previous_headline,omitempty"`
	PreviousBody     string      `json:"previous_body,omitempty"`
}

// GenerateResponse comes back from the Python core.
type CopyVariant struct {
	Headline    string      `json:"headline"`
	Body        string      `json:"body"`
	ToneNotes   string      `json:"tone_notes"`
	Attribution Attribution `json:"attribution"`
}

type GenerateCoreResponse struct {
	StyleID     string        `json:"style_id"`
	Variants    []CopyVariant `json:"variants"`
	Attribution Attribution   `json:"attribution"`
}

// UpdateDraftRequest allows inline editing of headline/body.
type UpdateDraftRequest struct {
	Headline string `json:"headline"`
	Body     string `json:"body"`
}

// TransitionRequest moves a draft through its workflow.
type TransitionRequest struct {
	ReviewedBy  string `json:"reviewed_by,omitempty"`
	PublishedBy string `json:"published_by,omitempty"`
	Note        string `json:"note,omitempty"`
}

type DraftListResult struct {
	Drafts     []Draft `json:"drafts"`
	Total      int     `json:"total"`
	Page       int     `json:"page"`
	PageSize   int     `json:"page_size"`
	TotalPages int     `json:"total_pages"`
}
