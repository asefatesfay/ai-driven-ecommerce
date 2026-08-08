-- Products catalog
CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    style_id    TEXT    NOT NULL UNIQUE,
    brand       TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    category    TEXT    NOT NULL,
    price       REAL    NOT NULL,
    sale_price  REAL,
    rating      REAL    NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    image_url   TEXT    NOT NULL,
    badge_label TEXT,
    badge_type  TEXT,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Product colors (one row per color per product)
CREATE TABLE IF NOT EXISTS product_colors (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL,
    hex         TEXT    NOT NULL
);

-- Product sizes (one row per size per product)
CREATE TABLE IF NOT EXISTS product_sizes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_label  TEXT    NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Product recipient tags
CREATE TABLE IF NOT EXISTS product_recipients (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    recipient   TEXT    NOT NULL  -- her|him|kids|teens|pets
);

-- Editorial gift products
CREATE TABLE IF NOT EXISTS editorial_products (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id          INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    editorial_headline  TEXT    NOT NULL,
    editorial_copy      TEXT    NOT NULL,
    attribution         TEXT    NOT NULL DEFAULT 'fashion-office',
    filter_recipient    TEXT    NOT NULL DEFAULT '',  -- JSON array stored as text
    filter_theme        TEXT    NOT NULL DEFAULT '',  -- JSON array stored as text
    filter_price        TEXT    NOT NULL,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    active              INTEGER NOT NULL DEFAULT 1
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    style_id      TEXT    NOT NULL,
    size          TEXT    NOT NULL DEFAULT '',
    color_name    TEXT    NOT NULL DEFAULT '',
    quantity      INTEGER NOT NULL DEFAULT 0,
    reserved_qty  INTEGER NOT NULL DEFAULT 0,
    last_synced_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    UNIQUE(product_id, size, color_name)
);

-- Inventory adjustment log
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(active);
CREATE INDEX IF NOT EXISTS idx_inventory_product   ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_editorial_active    ON editorial_products(active);
CREATE INDEX IF NOT EXISTS idx_recipients_product  ON product_recipients(product_id);
