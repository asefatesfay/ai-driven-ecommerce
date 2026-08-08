CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    type        TEXT    NOT NULL,
    channel     TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'pending',
    subject     TEXT    NOT NULL DEFAULT '',
    body        TEXT    NOT NULL DEFAULT '',
    metadata    TEXT    NOT NULL DEFAULT '{}',
    sent_at     DATETIME,
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL UNIQUE,
    email_enabled  INTEGER NOT NULL DEFAULT 1,
    sms_enabled    INTEGER NOT NULL DEFAULT 0,
    push_enabled   INTEGER NOT NULL DEFAULT 1,
    order_updates  INTEGER NOT NULL DEFAULT 1,
    promotions     INTEGER NOT NULL DEFAULT 1,
    price_alerts   INTEGER NOT NULL DEFAULT 1,
    updated_at     DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
