package api

import (
	"encoding/json"
	"net/http"

	"eylexander/portfolio/backend/src/ctrl"
	"eylexander/portfolio/backend/src/datastore"
)

type Handler struct {
	dataStore datastore.DataStore
	ctrl      *ctrl.Controller
}

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

// APIError represents an API error response
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func NewHandler(dataStore datastore.DataStore, ctrl *ctrl.Controller) *Handler {
	return &Handler{
		dataStore: dataStore,
		ctrl:      ctrl,
	}
}

// WriteJSON writes a JSON response
func (h *Handler) WriteJSON(w http.ResponseWriter, status int, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(data)
}

// WriteSuccess writes a successful JSON response
func (h *Handler) WriteSuccess(w http.ResponseWriter, data interface{}) error {
	return h.WriteJSON(w, http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// WriteError writes an error JSON response
func (h *Handler) WriteError(w http.ResponseWriter, status int, code, message, details string) error {
	return h.WriteJSON(w, status, Response{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}
