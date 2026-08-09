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

	"github.com/ai-ecommerce/user/internal/db"
	"github.com/ai-ecommerce/user/internal/handlers"
)

func main() {
	port := envOr("PORT", "8085")
	dsn := envOr("DATABASE_URL", "./user.db")

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

	user := &handlers.UserHandler{DB: database}

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger, chimiddleware.Recoverer, chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok","service":"user"}`)
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", user.Register)
		r.Post("/auth/login", user.Login)
		r.Get("/users/{id}", user.GetProfile)
		r.Put("/users/{id}", user.UpdateProfile)
		r.Get("/users/{id}/addresses", user.ListAddresses)
		r.Post("/users/{id}/addresses", user.CreateAddress)
	})

	log.Printf("user service on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
