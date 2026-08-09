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

	"github.com/ai-ecommerce/checkout/internal/db"
	"github.com/ai-ecommerce/checkout/internal/handlers"
)

func main() {
	port := envOr("PORT", "8084")
	dsn := envOr("DATABASE_URL", "./checkout.db")

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

	cart := &handlers.CartHandler{DB: database}
	wishlist := &handlers.WishlistHandler{DB: database}

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
		fmt.Fprintln(w, `{"status":"ok","service":"checkout"}`)
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Cart
		r.Get("/cart", cart.GetCart)
		r.Post("/cart/items", cart.AddItem)
		r.Put("/cart/items/{itemId}", cart.UpdateItem)
		r.Delete("/cart/items/{itemId}", cart.RemoveItem)
		r.Delete("/cart", cart.ClearCart)

		// Wishlist
		r.Get("/wishlist/{userId}", wishlist.GetWishlist)
		r.Post("/wishlist/{userId}", wishlist.AddToWishlist)
		r.Delete("/wishlist/{userId}/{productId}", wishlist.RemoveFromWishlist)
	})

	log.Printf("checkout service on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
