CREATE TABLE IF NOT EXISTS payments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      TEXT    NOT NULL,
    order_ref       TEXT    NOT NULL UNIQUE,
    amount          REAL    NOT NULL,
    currency        TEXT    NOT NULL DEFAULT 'USD',
    status          TEXT    NOT NULL DEFAULT 'pending',  -- pending | authorised | declined | refunded
    card_last4      TEXT    NOT NULL DEFAULT '',
    card_brand      TEXT    NOT NULL DEFAULT '',
    name_on_card    TEXT    NOT NULL DEFAULT '',
    created_at      DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at      DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_session  ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_orderref ON payments(order_ref);
