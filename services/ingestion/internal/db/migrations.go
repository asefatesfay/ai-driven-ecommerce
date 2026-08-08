package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
)

type rawDB interface {
	Exec(query string, args ...any) (sql.Result, error)
}

func MigrateDB(db rawDB, migrationsDir string) error {
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
