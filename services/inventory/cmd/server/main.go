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

	"github.com/ai-ecommerce/inventory/internal/db"
	"github.com/ai-ecommerce/inventory/internal/handlers"
	"github.com/ai-ecommerce/inventory/seed"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "./inventory.db"
	}

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

	if err := seed.Run(database); err != nil {
		log.Fatalf("seed: %v", err)
	}

	inventory := &handlers.InventoryHandler{DB: database}

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok","service":"inventory"}`)
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/inventory", inventory.BulkGetInventory)
		r.Get("/inventory/{productId}", inventory.GetInventory)
		r.Post("/inventory/adjust", inventory.AdjustInventory)
		r.Post("/inventory/sync", inventory.SyncInventory)
	})

	log.Printf("inventory service on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
