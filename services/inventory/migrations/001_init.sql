CREATE TABLE IF NOT EXISTS inventory (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id    INTEGER NOT NULL,
    style_id      TEXT    NOT NULL,
    size          TEXT    NOT NULL DEFAULT '',
    color_name    TEXT    NOT NULL DEFAULT '',
    quantity      INTEGER NOT NULL DEFAULT 0,
    reserved_qty  INTEGER NOT NULL DEFAULT 0,
    last_synced_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    UNIQUE(product_id, size, color_name)
);

CREATE TABLE IF NOT EXISTS inventory_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    style_id   TEXT    NOT NULL,
    size       TEXT    NOT NULL DEFAULT '',
    color_name TEXT    NOT NULL DEFAULT '',
    delta      INTEGER NOT NULL,
    reason     TEXT    NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_style   ON inventory(style_id);
