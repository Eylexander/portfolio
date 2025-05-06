package server

import (
	"eylexander/portfolio/backend/src/ctrl"
	"net/http"
)

type APIFunc func(w http.ResponseWriter, r *http.Request) error

type APIError struct {
	Error string `json:"message"`
}

type APIServer struct {
	serverAddress string
	store         ctrl.Storage
}
