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

	"github.com/nordstrom/gift-edit/api/internal/db"
	"github.com/nordstrom/gift-edit/api/internal/handlers"
	"github.com/nordstrom/gift-edit/api/seed"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "./gift-edit.db"
	}

	// Resolve migrations path relative to this file or the binary
	_, filename, _, _ := runtime.Caller(0)
	migrationsDir := filepath.Join(filepath.Dir(filename), "..", "..", "migrations")
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		migrationsDir = "./migrations"
	}

	// Open DB + migrate
	database, err := db.Open(dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer database.Close()

	if err := db.Migrate(database, migrationsDir); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	// Seed with demo data
	if err := seed.Run(database); err != nil {
		log.Fatalf("seed: %v", err)
	}

	// Handlers
	catalog := &handlers.CatalogHandler{DB: database}
	inventory := &handlers.InventoryHandler{DB: database}

	// Router
	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3333", "https://*.nordstrom.com"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok"}`)
	})

	// Catalog routes
	r.Route("/api", func(r chi.Router) {
		// Products
		r.Get("/products", catalog.ListProducts)
		r.Post("/products", catalog.CreateProduct)
		r.Get("/products/{id}", catalog.GetProduct)
		r.Put("/products/{id}", catalog.UpdateProduct)
		r.Get("/products/style/{styleId}", catalog.GetProductByStyle)

		// Editorial (Gift Edit)
		r.Get("/editorial", catalog.ListEditorial)

		// Inventory
		r.Get("/inventory", inventory.BulkGetInventory)          // ?style_ids=A,B,C
		r.Get("/inventory/{productId}", inventory.GetInventory)
		r.Post("/inventory/adjust", inventory.AdjustInventory)
		r.Post("/inventory/sync", inventory.SyncInventory)
	})

	log.Printf("API listening on :%s  →  http://localhost:%s", port, port)
	log.Printf("Routes:\n"+
		"  GET  /health\n"+
		"  GET  /api/products\n"+
		"  POST /api/products\n"+
		"  GET  /api/products/:id\n"+
		"  PUT  /api/products/:id\n"+
		"  GET  /api/products/style/:styleId\n"+
		"  GET  /api/editorial\n"+
		"  GET  /api/inventory?style_ids=...\n"+
		"  GET  /api/inventory/:productId\n"+
		"  POST /api/inventory/adjust\n"+
		"  POST /api/inventory/sync\n")

	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
