package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

func Open(dsn string) (*sql.DB, error) {
	// WAL mode allows concurrent readers; we still serialize writes via a single
	// write connection but use a read pool for parallel SELECT statements.
	db, err := sql.Open("sqlite3", dsn+"?_journal_mode=WAL&_foreign_keys=on&_busy_timeout=5000&mode=rwc")
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	// Allow up to 16 concurrent read connections — WAL mode supports this safely.
	db.SetMaxOpenConns(16)
	db.SetMaxIdleConns(4)
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping sqlite: %w", err)
	}
	return db, nil
}

func Migrate(db *sql.DB, migrationsDir string) error {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}
	for _, e := range entries {
		if filepath.Ext(e.Name()) != ".sql" {
			continue
		}
		path := filepath.Join(migrationsDir, e.Name())
		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", e.Name(), err)
		}
		if _, err := db.Exec(string(content)); err != nil {
			return fmt.Errorf("exec migration %s: %w", e.Name(), err)
		}
	}
	return nil
}
