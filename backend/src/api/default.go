package api

import (
	"log"
	"net/http"
	"time"
)

func (s *Handler) DefaultLocation(w http.ResponseWriter, r *http.Request) error {
	response := map[string]interface{}{
		"service":   "Portfolio Backend",
		"version":   getVersion(),
		"timestamp": time.Now(),
	}

	if err := s.WriteSuccess(w, response); err != nil {
		log.Printf("Error writing default location response: %v", err)
		return err
	}
	return nil
}
