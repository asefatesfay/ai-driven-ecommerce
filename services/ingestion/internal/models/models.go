package models

import "time"

type PipelineJobStatus string

const (
	JobStatusQueued     PipelineJobStatus = "queued"
	JobStatusRunning    PipelineJobStatus = "running"
	JobStatusCompleted  PipelineJobStatus = "completed"
	JobStatusFailed     PipelineJobStatus = "failed"
)

type PipelineJob struct {
	ID          int64             `json:"id"`
	Source      string            `json:"source"` // csv|api|webhook|manual
	Status      PipelineJobStatus `json:"status"`
	TotalRows   int               `json:"total_rows"`
	Processed   int               `json:"processed"`
	Failed      int               `json:"failed"`
	ErrorLog    string            `json:"error_log,omitempty"`
	StartedAt   *time.Time        `json:"started_at,omitempty"`
	CompletedAt *time.Time        `json:"completed_at,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
}

type ProductIngestionRecord struct {
	StyleID     string   `json:"style_id"`
	Brand       string   `json:"brand"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Price       float64  `json:"price"`
	SalePrice   *float64 `json:"sale_price,omitempty"`
	ImageURL    string   `json:"image_url"`
	Colors      []string `json:"colors"`
	Sizes       []string `json:"sizes"`
	Recipients  []string `json:"recipients"`
}

type InventoryIngestionRecord struct {
	StyleID   string `json:"style_id"`
	Size      string `json:"size"`
	ColorName string `json:"color_name"`
	Quantity  int    `json:"quantity"`
}

type IngestProductsRequest struct {
	Source   string                   `json:"source"`
	Products []ProductIngestionRecord  `json:"products"`
}

type IngestInventoryRequest struct {
	Source    string                     `json:"source"`
	Inventory []InventoryIngestionRecord  `json:"inventory"`
}
