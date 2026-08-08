CREATE TABLE IF NOT EXISTS pipeline_jobs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    source       TEXT    NOT NULL DEFAULT 'manual',
    status       TEXT    NOT NULL DEFAULT 'queued',
    total_rows   INTEGER NOT NULL DEFAULT 0,
    processed    INTEGER NOT NULL DEFAULT 0,
    failed       INTEGER NOT NULL DEFAULT 0,
    error_log    TEXT    NOT NULL DEFAULT '',
    started_at   DATETIME,
    completed_at DATETIME,
    created_at   DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON pipeline_jobs(status);
