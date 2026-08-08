package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

type ServiceConfig struct {
	Name    string
	BaseURL string
	Prefix  string
}

func main() {
	port := envOr("PORT", "8080")

	services := []ServiceConfig{
		{Name: "catalog", BaseURL: envOr("CATALOG_URL", "http://localhost:8081"), Prefix: "/catalog"},
		{Name: "inventory", BaseURL: envOr("INVENTORY_URL", "http://localhost:8082"), Prefix: "/inventory"},
		{Name: "order", BaseURL: envOr("ORDER_URL", "http://localhost:8083"), Prefix: "/order"},
		{Name: "checkout", BaseURL: envOr("CHECKOUT_URL", "http://localhost:8084"), Prefix: "/checkout"},
		{Name: "user", BaseURL: envOr("USER_URL", "http://localhost:8085"), Prefix: "/user"},
		{Name: "notification", BaseURL: envOr("NOTIFICATION_URL", "http://localhost:8086"), Prefix: "/notification"},
		{Name: "ingestion", BaseURL: envOr("INGESTION_URL", "http://localhost:8087"), Prefix: "/ingestion"},
		{Name: "ai-assistant", BaseURL: envOr("AI_ASSISTANT_URL", "http://localhost:8088"), Prefix: "/ai"},
		{Name: "editorial", BaseURL: envOr("EDITORIAL_URL", "http://localhost:8089"), Prefix: "/editorial"},
	}

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(httprate.LimitAll(1000, 1))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization", "X-Request-ID"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok","service":"gateway"}`)
	})

	for _, svc := range services {
		target, err := url.Parse(svc.BaseURL)
		if err != nil {
			log.Fatalf("parse %s url: %v", svc.Name, err)
		}
		proxy := httputil.NewSingleHostReverseProxy(target)
		prefix := svc.Prefix
		r.Handle(prefix+"/*", http.StripPrefix(prefix, proxy))
		log.Printf("  %s  →  %s%s/*", svc.BaseURL+"/api/v1", port, prefix)
	}

	// Direct service-level health aggregation
	r.Get("/services/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		statuses := make(map[string]string)
		for _, svc := range services {
			resp, err := http.Get(svc.BaseURL + "/health")
			if err != nil || resp.StatusCode != 200 {
				statuses[svc.Name] = "down"
			} else {
				statuses[svc.Name] = "up"
			}
			if resp != nil {
				resp.Body.Close()
			}
		}
		allUp := true
		for _, s := range statuses {
			if s != "up" {
				allUp = false
				break
			}
		}
		overall := "healthy"
		if !allUp {
			overall = "degraded"
		}
		enc := fmt.Sprintf(`{"status":"%s","services":{`, overall)
		pairs := make([]string, 0, len(statuses))
		for k, v := range statuses {
			pairs = append(pairs, fmt.Sprintf(`"%s":"%s"`, k, v))
		}
		enc += strings.Join(pairs, ",") + "}}"
		fmt.Fprintln(w, enc)
	})

	log.Printf("gateway on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
