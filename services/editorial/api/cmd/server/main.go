// @title Editorial Service API
// @version 1.0
// @description AI-driven editorial copy generation and draft management
// @host localhost:8089
// @BasePath /api/v1
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/ai-ecommerce/editorial/internal/db"
	"github.com/ai-ecommerce/editorial/internal/handlers"
	_ "github.com/ai-ecommerce/editorial/docs"
)

func main() {
	port := envOr("PORT", "8089")
	dsn := envOr("DATABASE_URL", "./editorial.db")
	coreURL := envOr("EDITORIAL_CORE_URL", "http://localhost:9100")
	catalogURL := envOr("CATALOG_URL", "http://localhost:8081")

	_, filename, _, _ := runtime.Caller(0)
	migrationsDir := filepath.Join(filepath.Dir(filename), "..", "..", "migrations")
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		migrationsDir = "./migrations"
	}

	database, err := db.Open(dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer database.Close()

	if err := db.Migrate(database, migrationsDir); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	drafts := handlers.NewDraftHandler(database, coreURL, catalogURL)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger, chimiddleware.Recoverer, chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3001", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok","service":"editorial"}`)
	})

	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/drafts", drafts.ListDrafts)
		r.Post("/drafts/generate", drafts.Generate)
		r.Get("/drafts/{id}", drafts.GetDraft)
		r.Put("/drafts/{id}", drafts.UpdateDraft)
		r.Post("/drafts/{id}/approve", drafts.ApproveDraft)
		r.Post("/drafts/{id}/publish", drafts.PublishDraft)
		r.Post("/drafts/{id}/archive", drafts.ArchiveDraft)
	})

	log.Printf("editorial service on :%s  →  core %s  →  catalog %s", port, coreURL, catalogURL)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
