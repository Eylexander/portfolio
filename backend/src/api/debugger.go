package api

import (
	"log"
	"net/http"
)

func (h *Handler) StartDebugger(w http.ResponseWriter, r *http.Request) error {
	switch r.Method {
	case http.MethodGet:
		return h.GetDebugger(w, r)
	case http.MethodPost:
		return h.PostDebugger(w, r)
	default:
		return h.WriteError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED",
			"Method not allowed", "Only GET and POST are supported")
	}
}

func (h *Handler) GetDebugger(w http.ResponseWriter, _ *http.Request) error {
	h.dataStore.DoDebug()
	return h.WriteSuccess(w, map[string]string{"message": "Debugger started"})
}

func (h *Handler) PostDebugger(w http.ResponseWriter, r *http.Request) error {
	// TODO: Parse request body for debug configuration
	return h.WriteSuccess(w, map[string]string{"message": "Debug configuration updated"})
}

func (h *Handler) GetDebugs(w http.ResponseWriter, _ *http.Request) error {
	response, err := h.dataStore.GetDebugs()
	if err != nil {
		log.Printf("Error getting debugs: %v", err)
		return h.WriteError(w, http.StatusInternalServerError, "DATABASE_ERROR",
			"Failed to retrieve debug data", err.Error())
	}

	return h.WriteSuccess(w, response)
}
