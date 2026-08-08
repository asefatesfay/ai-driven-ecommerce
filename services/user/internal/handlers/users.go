package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ai-ecommerce/user/internal/db"
	"github.com/ai-ecommerce/user/internal/middleware"
	"github.com/ai-ecommerce/user/internal/models"
)

type UserHandler struct {
	DB *sql.DB
}

// POST /api/v1/auth/register
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if req.Email == "" || req.Password == "" {
		middleware.BadRequest(w, "email and password required")
		return
	}
	user, err := db.CreateUser(h.DB, req)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusCreated, user)
}

// POST /api/v1/auth/login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	user, token, err := db.AuthenticateUser(h.DB, req)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if user == nil {
		middleware.Unauthorized(w)
		return
	}
	middleware.JSON(w, http.StatusOK, models.AuthResponse{User: *user, AccessToken: token})
}

// GET /api/v1/users/{id}
func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	user, err := db.GetUser(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if user == nil {
		middleware.NotFound(w)
		return
	}
	middleware.JSON(w, http.StatusOK, user)
}

// PUT /api/v1/users/{id}
func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	var req models.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	user, err := db.UpdateProfile(h.DB, id, req)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, user)
}

// GET /api/v1/users/{id}/addresses
func (h *UserHandler) ListAddresses(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	addrs, err := db.GetAddresses(h.DB, id)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if addrs == nil {
		addrs = []models.Address{}
	}
	middleware.JSON(w, http.StatusOK, map[string]any{"addresses": addrs})
}

// POST /api/v1/users/{id}/addresses
func (h *UserHandler) CreateAddress(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	var addr models.Address
	if err := json.NewDecoder(r.Body).Decode(&addr); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	addr.UserID = id
	created, err := db.CreateAddress(h.DB, addr)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusCreated, created)
}
