package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ai-ecommerce/notification/internal/db"
	"github.com/ai-ecommerce/notification/internal/middleware"
	"github.com/ai-ecommerce/notification/internal/models"
)

type NotificationHandler struct {
	DB *sql.DB
}

// POST /api/v1/notifications/send
func (h *NotificationHandler) Send(w http.ResponseWriter, r *http.Request) {
	var req models.SendNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	if req.UserID == 0 || req.Type == "" {
		middleware.BadRequest(w, "user_id and type required")
		return
	}

	n, err := db.CreateNotification(h.DB, req)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}

	// Mark as sent immediately (real system would queue this)
	db.MarkSent(h.DB, n.ID) //nolint:errcheck

	middleware.JSON(w, http.StatusCreated, n)
}

// GET /api/v1/notifications/{userId}
func (h *NotificationHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	items, err := db.ListNotifications(h.DB, userID, 50)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	if items == nil {
		items = []models.Notification{}
	}
	middleware.JSON(w, http.StatusOK, map[string]any{"notifications": items, "total": len(items)})
}

// GET /api/v1/notifications/{userId}/preferences
func (h *NotificationHandler) GetPreferences(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	prefs, err := db.GetPreferences(h.DB, userID)
	if err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, prefs)
}

// PUT /api/v1/notifications/{userId}/preferences
func (h *NotificationHandler) UpdatePreferences(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userId"), 10, 64)
	if err != nil {
		middleware.BadRequest(w, "invalid user id")
		return
	}
	var prefs models.NotificationPreferences
	if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
		middleware.BadRequest(w, "invalid request body")
		return
	}
	prefs.UserID = userID
	if err := db.UpsertPreferences(h.DB, prefs); err != nil {
		middleware.InternalError(w, err)
		return
	}
	middleware.JSON(w, http.StatusOK, prefs)
}
