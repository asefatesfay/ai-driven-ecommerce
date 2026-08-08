CREATE TABLE IF NOT EXISTS carts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    session_id  TEXT    NOT NULL DEFAULT '',
    created_at  DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at  DATETIME NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id),
    UNIQUE(session_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id     INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL,
    style_id    TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    brand       TEXT    NOT NULL,
    image_url   TEXT    NOT NULL DEFAULT '',
    size        TEXT    NOT NULL DEFAULT '',
    color_name  TEXT    NOT NULL DEFAULT '',
    quantity    INTEGER NOT NULL DEFAULT 1,
    unit_price  REAL    NOT NULL,
    added_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    UNIQUE(cart_id, product_id, size, color_name)
);

CREATE TABLE IF NOT EXISTS wishlists (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    product_id  INTEGER NOT NULL,
    style_id    TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    brand       TEXT    NOT NULL,
    image_url   TEXT    NOT NULL DEFAULT '',
    price       REAL    NOT NULL,
    sale_price  REAL,
    added_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart   ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user    ON wishlists(user_id);
