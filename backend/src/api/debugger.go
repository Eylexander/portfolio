package api

import (
	"encoding/json"
	"log"
	"net/http"
)

func (s *Handler) StartDebugger(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "GET" {
		s.dataStore.DoDebug()
		return s.GetDebugger(w, r)
	}
	if r.Method == "POST" {
		return s.PostDebugger(w, r)
	}
	return nil
}

func (s *Handler) GetDebugger(w http.ResponseWriter, _ *http.Request) error {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Get Debugger"})
	return nil
}

func (s *Handler) PostDebugger(w http.ResponseWriter, _ *http.Request) error {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Post Debugger"})
	return nil
}

func (s *Handler) GetDebugs(w http.ResponseWriter, _ *http.Request) error {
	response, err := s.dataStore.GetDebugs()
	if err != nil {
		log.Printf("Error: %v", err)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
	return nil
}
