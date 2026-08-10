package main

import (
	"fmt"
	"io"
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

// swaggerUIHTML returns a Swagger UI page that loads all service specs via the
// gateway's own /swagger/specs/* proxy, so there are no cross-origin issues.
func swaggerUIHTML(specs []ServiceConfig) string {
	// Build the JS urls array for the Swagger UI multi-spec dropdown.
	var urlEntries []string
	for _, s := range specs {
		urlEntries = append(urlEntries,
			fmt.Sprintf(`{url:"/swagger/specs/%s/swagger.json",name:"%s"}`, s.Name, s.Name),
		)
	}
	urlsJS := "[" + strings.Join(urlEntries, ",") + "]"

	return `<!DOCTYPE html>
<html>
<head>
  <title>API Docs — ai-ecommerce</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
<script>
window.onload = function() {
  SwaggerUIBundle({
    urls: ` + urlsJS + `,
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout",
    deepLinking: true,
    displayRequestDuration: true,
  });
};
</script>
</body>
</html>`
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
		{Name: "payment", BaseURL: envOr("PAYMENT_URL", "http://localhost:8090"), Prefix: "/payment"},
	}

	// Build a name→baseURL map for the swagger spec proxy.
	svcByName := make(map[string]string, len(services))
	for _, s := range services {
		svcByName[s.Name] = s.BaseURL
	}

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(httprate.LimitAll(1000, 1))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization", "X-Request-ID"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok","service":"gateway"}`)
	})

	// ── Unified Swagger UI ───────────────────────────────────────────────────
	//
	// GET /swagger           → Swagger UI (multi-spec dropdown)
	// GET /swagger/specs/{svc}/swagger.json  → proxy to svc's /docs/swagger.json
	//
	r.Get("/swagger", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		fmt.Fprint(w, swaggerUIHTML(services))
	})

	// Proxy each service's swagger.json to avoid browser CORS restrictions.
	// Each service mounts httpSwagger at /swagger/*, which exposes the spec
	// at /swagger/doc.json.
	r.Get("/swagger/specs/{svc}/swagger.json", func(w http.ResponseWriter, r *http.Request) {
		svcName := chi.URLParam(r, "svc")
		baseURL, ok := svcByName[svcName]
		if !ok {
			http.Error(w, "unknown service", http.StatusNotFound)
			return
		}
		resp, err := http.Get(baseURL + "/swagger/doc.json")
		if err != nil {
			http.Error(w, "upstream unavailable: "+err.Error(), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body) //nolint:errcheck
	})

	// ── Service reverse proxies ──────────────────────────────────────────────
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
	log.Printf("unified swagger UI → http://localhost:%s/swagger", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
