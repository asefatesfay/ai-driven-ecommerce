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

// Send sends a notification to a user.
// @Summary Send notification
// @Description Send a notification to a user via the specified channel
// @Tags notifications
// @Accept json
// @Produce json
// @Param body body models.SendNotificationRequest true "Notification request"
// @Success 201 {object} models.Notification
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /notifications/send [post]
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

// List returns notifications for a user.
// @Summary List notifications
// @Description Get the most recent notifications for a user (up to 50)
// @Tags notifications
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /notifications/{userId} [get]
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

// GetPreferences returns notification preferences for a user.
// @Summary Get notification preferences
// @Description Get the notification channel and type preferences for a user
// @Tags notifications
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {object} models.NotificationPreferences
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /notifications/{userId}/preferences [get]
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

// UpdatePreferences updates notification preferences for a user.
// @Summary Update notification preferences
// @Description Update the notification channel and type preferences for a user
// @Tags notifications
// @Accept json
// @Produce json
// @Param userId path int true "User ID"
// @Param body body models.NotificationPreferences true "Preferences to update"
// @Success 200 {object} models.NotificationPreferences
// @Failure 400 {object} middleware.APIError
// @Failure 500 {object} middleware.APIError
// @Router /notifications/{userId}/preferences [put]
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
