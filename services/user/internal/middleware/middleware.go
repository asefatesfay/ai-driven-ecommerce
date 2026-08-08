package middleware

import (
	"encoding/json"
	"net/http"
)

type APIError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func JSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v) //nolint:errcheck
}

func Error(w http.ResponseWriter, status int, msg string) {
	JSON(w, status, APIError{Code: status, Message: msg})
}

func NotFound(w http.ResponseWriter)             { Error(w, http.StatusNotFound, "not found") }
func BadRequest(w http.ResponseWriter, msg string) { Error(w, http.StatusBadRequest, msg) }
func InternalError(w http.ResponseWriter, err error) {
	Error(w, http.StatusInternalServerError, err.Error())
}
func Unauthorized(w http.ResponseWriter) { Error(w, http.StatusUnauthorized, "unauthorized") }
