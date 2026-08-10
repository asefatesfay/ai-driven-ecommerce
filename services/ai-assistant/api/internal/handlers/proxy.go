package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/ai-ecommerce/ai-assistant-api/internal/middleware"
)

// ProxyHandler forwards requests to the Python FastAPI core.
type ProxyHandler struct {
	CoreURL string
	proxy   *httputil.ReverseProxy
	client  *http.Client
}

func NewProxyHandler(coreURL string) *ProxyHandler {
	target, err := url.Parse(coreURL)
	if err != nil {
		log.Fatalf("invalid core url %s: %v", coreURL, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	// Rewrite /api/v1/assistant/* → /api/v1/* before forwarding to the core.
	proxy.Director = func(req *http.Request) {
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		req.Host = target.Host
		req.URL.Path = strings.Replace(req.URL.Path, "/assistant", "", 1)
	}
	// Strip CORS headers from upstream — the gateway owns CORS.
	proxy.ModifyResponse = func(resp *http.Response) error {
		resp.Header.Del("Access-Control-Allow-Origin")
		resp.Header.Del("Access-Control-Allow-Methods")
		resp.Header.Del("Access-Control-Allow-Headers")
		resp.Header.Del("Access-Control-Allow-Credentials")
		return nil
	}
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("proxy error: %v", err)
		middleware.ServiceUnavailable(w, "ai-assistant core unavailable")
	}
	return &ProxyHandler{
		CoreURL: coreURL,
		proxy:   proxy,
		client:  &http.Client{Timeout: 30 * time.Second},
	}
}

// Forward proxies the request to the Python core unchanged.
// @Summary Forward to AI core
// @Description Proxy request to the Python AI core service
// @Tags assistant
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 503 {object} middleware.APIError
// @Router /assistant/index [post]
func (h *ProxyHandler) Forward(w http.ResponseWriter, r *http.Request) {
	h.proxy.ServeHTTP(w, r)
}

// Health checks the Python core's /health endpoint and returns combined status.
// @Summary Health check
// @Description Check the health of the AI assistant gateway and Python core
// @Tags assistant
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 503 {object} middleware.APIError
// @Router /health [get]
func (h *ProxyHandler) Health(w http.ResponseWriter, r *http.Request) {
	resp, err := h.client.Get(h.CoreURL + "/health")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		fmt.Fprintln(w, `{"status":"degraded","service":"ai-assistant","core":"unreachable"}`)
		return
	}
	defer resp.Body.Close()

	var coreHealth map[string]any
	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &coreHealth) //nolint:errcheck

	coreHealth["gateway"] = "ok"
	middleware.JSON(w, http.StatusOK, coreHealth)
}

// ValidateChat validates the incoming chat request before forwarding.
// @Summary Chat with AI assistant
// @Description Send a chat message to the AI assistant; requires message and session_id fields
// @Tags assistant
// @Accept json
// @Produce json
// @Param body body handlers.ChatRequest true "Chat request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} middleware.APIError
// @Failure 503 {object} middleware.APIError
// @Router /assistant/chat [post]
func (h *ProxyHandler) ValidateChat(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			middleware.BadRequest(w, "could not read request body")
			return
		}
		r.Body = io.NopCloser(bytes.NewReader(body))

		var payload map[string]any
		if err := json.Unmarshal(body, &payload); err != nil {
			middleware.BadRequest(w, "invalid JSON")
			return
		}
		if _, ok := payload["message"]; !ok {
			middleware.BadRequest(w, "message field required")
			return
		}
		if _, ok := payload["session_id"]; !ok {
			middleware.BadRequest(w, "session_id field required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ValidateSearch validates the incoming search request before forwarding.
// @Summary Semantic product search
// @Description Perform semantic search over the product catalog; requires query field
// @Tags assistant
// @Accept json
// @Produce json
// @Param body body handlers.SearchRequest true "Search request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} middleware.APIError
// @Failure 503 {object} middleware.APIError
// @Router /assistant/search [post]
func (h *ProxyHandler) ValidateSearch(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			middleware.BadRequest(w, "could not read request body")
			return
		}
		r.Body = io.NopCloser(bytes.NewReader(body))

		var payload map[string]any
		if err := json.Unmarshal(body, &payload); err != nil {
			middleware.BadRequest(w, "invalid JSON")
			return
		}
		if _, ok := payload["query"]; !ok {
			middleware.BadRequest(w, "query field required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ChatRequest is the body for the /assistant/chat endpoint.
type ChatRequest struct {
	Message   string `json:"message"`
	SessionID string `json:"session_id"`
}

// SearchRequest is the body for the /assistant/search endpoint.
type SearchRequest struct {
	Query string `json:"query"`
}
