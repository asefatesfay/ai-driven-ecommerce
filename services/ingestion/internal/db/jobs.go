package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/ai-ecommerce/ingestion/internal/models"
)

func CreateJob(db *sql.DB, source string) (int64, error) {
	res, err := db.Exec(
		"INSERT INTO pipeline_jobs (source, status) VALUES (?, 'queued')",
		source,
	)
	if err != nil {
		return 0, fmt.Errorf("create job: %w", err)
	}
	return res.LastInsertId()
}

func GetJob(db *sql.DB, id int64) (*models.PipelineJob, error) {
	row := db.QueryRow(
		`SELECT id, source, status, total_rows, processed, failed, error_log,
		        started_at, completed_at, created_at
		 FROM pipeline_jobs WHERE id = ?`, id,
	)
	return scanJob(row)
}

func UpdateJobProgress(db *sql.DB, id int64, processed, failed int, errLog string) error {
	_, err := db.Exec(
		`UPDATE pipeline_jobs
		 SET processed=?, failed=?, error_log=?
		 WHERE id=?`,
		processed, failed, errLog, id,
	)
	return err
}

func StartJob(db *sql.DB, id int64, totalRows int) error {
	now := time.Now()
	_, err := db.Exec(
		`UPDATE pipeline_jobs SET status='running', total_rows=?, started_at=? WHERE id=?`,
		totalRows, now, id,
	)
	return err
}

func CompleteJob(db *sql.DB, id int64, status string) error {
	now := time.Now()
	_, err := db.Exec(
		`UPDATE pipeline_jobs SET status=?, completed_at=? WHERE id=?`,
		status, now, id,
	)
	return err
}

func ListJobs(db *sql.DB, limit int) ([]models.PipelineJob, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := db.Query(
		`SELECT id, source, status, total_rows, processed, failed, error_log,
		        started_at, completed_at, created_at
		 FROM pipeline_jobs ORDER BY id DESC LIMIT ?`, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("list jobs: %w", err)
	}
	defer rows.Close()

	var jobs []models.PipelineJob
	for rows.Next() {
		j, err := scanJobRow(rows)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, *j)
	}
	return jobs, nil
}

type scanner interface{ Scan(dest ...any) error }

func scanJob(s scanner) (*models.PipelineJob, error) {
	var j models.PipelineJob
	var errLog sql.NullString
	return &j, s.Scan(
		&j.ID, &j.Source, &j.Status, &j.TotalRows, &j.Processed, &j.Failed,
		&errLog, &j.StartedAt, &j.CompletedAt, &j.CreatedAt,
	)
}

func scanJobRow(rows *sql.Rows) (*models.PipelineJob, error) {
	var j models.PipelineJob
	var errLog sql.NullString
	return &j, rows.Scan(
		&j.ID, &j.Source, &j.Status, &j.TotalRows, &j.Processed, &j.Failed,
		&errLog, &j.StartedAt, &j.CompletedAt, &j.CreatedAt,
	)
}
