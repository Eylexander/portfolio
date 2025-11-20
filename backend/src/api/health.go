package api

import (
	"log"
	"net/http"
	"os"
	"time"

	"eylexander/portfolio/backend/src/consts"
)

func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) error {
	dbStatus := "disconnected"
	if err := h.dataStore.HealthCheck(); err == nil {
		dbStatus = "connected"
	}

	response := consts.HealthResponse{
		Status:    "ok",
		Timestamp: time.Now(),
		Database:  dbStatus,
		Version:   getVersion(),
	}

	// If database is not connected, return 503
	if dbStatus == "disconnected" {
		response.Status = "error"
		if err := h.WriteJSON(w, http.StatusServiceUnavailable, Response{
			Success: false,
			Data:    response,
		}); err != nil {
			log.Printf("Failed to write health check error response: %v", err)
		}
		return nil
	}

	if err := h.WriteSuccess(w, response); err != nil {
		log.Printf("Failed to write health check response: %v", err)
	}
	return nil
}

func getVersion() string {
	if version := os.Getenv("APP_VERSION"); version != "" {
		return version
	}
	return "dev"
}
