CREATE TABLE IF NOT EXISTS orders (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL,
    status              TEXT    NOT NULL DEFAULT 'pending',
    shipping_address    TEXT    NOT NULL DEFAULT '{}',  -- JSON
    subtotal            REAL    NOT NULL DEFAULT 0,
    shipping_cost       REAL    NOT NULL DEFAULT 0,
    tax                 REAL    NOT NULL DEFAULT 0,
    total               REAL    NOT NULL DEFAULT 0,
    payment_intent_id   TEXT    NOT NULL DEFAULT '',
    tracking_number     TEXT    NOT NULL DEFAULT '',
    notes               TEXT    NOT NULL DEFAULT '',
    created_at          DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at          DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL,
    style_id    TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    brand       TEXT    NOT NULL,
    image_url   TEXT    NOT NULL DEFAULT '',
    size        TEXT    NOT NULL DEFAULT '',
    color_name  TEXT    NOT NULL DEFAULT '',
    quantity    INTEGER NOT NULL DEFAULT 1,
    unit_price  REAL    NOT NULL,
    total       REAL    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items   ON order_items(order_id);
