package api

import "net/http"

func (s *Handler) DefaultLocation(w http.ResponseWriter, r *http.Request) error {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("<p>Backend API Server</p>"))
	return nil
}
