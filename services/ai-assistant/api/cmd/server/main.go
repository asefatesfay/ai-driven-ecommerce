package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"

	"github.com/ai-ecommerce/ai-assistant-api/internal/handlers"
)

func main() {
	port := envOr("PORT", "8088")
	coreURL := envOr("AI_CORE_URL", "http://localhost:19010")

	proxy := handlers.NewProxyHandler(coreURL)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.Timeout(35 * time.Second))
	// Per-IP rate limiting: 60 requests/minute for AI endpoints
	r.Use(httprate.LimitByIP(60, time.Minute))

	r.Get("/health", proxy.Health)

	r.Route("/api/v1", func(r chi.Router) {
		// Chat — validate then forward to Python core
		r.With(proxy.ValidateChat).Post("/assistant/chat", proxy.Forward)

		// Semantic search — validate then forward
		r.With(proxy.ValidateSearch).Post("/assistant/search", proxy.Forward)

		// Product indexing (internal only — call from ingestion service)
		r.Post("/assistant/index", proxy.Forward)
		r.Get("/assistant/index/stats", proxy.Forward)
	})

	log.Printf("ai-assistant API on :%s  →  core at %s", port, coreURL)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// _ suppresses unused import warning during early dev
var _ = fmt.Sprintf
