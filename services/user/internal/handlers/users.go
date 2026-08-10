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

// Register creates a new user account.
// @Summary Register user
// @Description Register a new customer account with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param body body models.RegisterRequest true "Registration details"
// @Success 201 {object} models.User
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /auth/register [post]
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

// Login authenticates a user and returns an access token.
// @Summary Login user
// @Description Authenticate with email and password, returns user and access token
// @Tags auth
// @Accept json
// @Produce json
// @Param body body models.LoginRequest true "Login credentials"
// @Success 200 {object} models.AuthResponse
// @Failure 400 {object} middleware.APIError
// @Failure 401 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /auth/login [post]
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

// GetProfile returns a user profile by ID.
// @Summary Get user profile
// @Description Get the profile of a user by their numeric ID
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 400 {object} middleware.APIError
// @Failure 404 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /users/{id} [get]
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

// UpdateProfile updates a user's profile.
// @Summary Update user profile
// @Description Update profile fields for an existing user
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param body body models.UpdateProfileRequest true "Profile update"
// @Success 200 {object} models.User
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /users/{id} [put]
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

// ListAddresses returns all saved addresses for a user.
// @Summary List user addresses
// @Description Get all saved shipping addresses for a user
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /users/{id}/addresses [get]
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

// CreateAddress adds a new address for a user.
// @Summary Create user address
// @Description Add a new shipping address for a user
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param body body models.Address true "Address details"
// @Success 201 {object} models.Address
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /users/{id}/addresses [post]
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
