CREATE TABLE IF NOT EXISTS drafts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    style_id     TEXT    NOT NULL,
    product_name TEXT    NOT NULL DEFAULT '',
    brand        TEXT    NOT NULL DEFAULT '',
    attribution  TEXT    NOT NULL,   -- fashion-office|buyer|stylist|customer-loved
    headline     TEXT    NOT NULL DEFAULT '',
    body         TEXT    NOT NULL DEFAULT '',
    tone_notes   TEXT    NOT NULL DEFAULT '',
    status       TEXT    NOT NULL DEFAULT 'draft', -- draft|approved|published|archived
    themes       TEXT    NOT NULL DEFAULT '[]',    -- JSON array
    price_range  TEXT    NOT NULL DEFAULT '',
    generated_by TEXT    NOT NULL DEFAULT 'ai',    -- ai|human
    reviewed_by  TEXT,
    published_by TEXT,
    published_at DATETIME,
    created_at   DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at   DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_drafts_style    ON drafts(style_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status   ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_updated  ON drafts(updated_at DESC);
