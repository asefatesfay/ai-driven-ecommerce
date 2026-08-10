// @title Catalog Service API
// @version 1.0
// @description Product catalog management
// @host localhost:8081
// @BasePath /api/v1
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/go-chi/chi/v5"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/ai-ecommerce/catalog/internal/db"
	"github.com/ai-ecommerce/catalog/internal/handlers"
	"github.com/ai-ecommerce/catalog/seed"
	_ "github.com/ai-ecommerce/catalog/docs"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "./catalog.db"
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

	catalog := &handlers.CatalogHandler{DB: database}

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
		fmt.Fprintln(w, `{"status":"ok","service":"catalog"}`)
	})

	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/products", catalog.ListProducts)
		r.Post("/products", catalog.CreateProduct)
		r.Get("/products/{id}", catalog.GetProduct)
		r.Put("/products/{id}", catalog.UpdateProduct)
		r.Get("/products/style/{styleId}", catalog.GetProductByStyle)
		r.Get("/editorial", catalog.ListEditorial)
		r.Put("/editorial/products/{styleId}", catalog.UpsertEditorial)
	})

	log.Printf("catalog service on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
