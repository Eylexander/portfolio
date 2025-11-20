package api

import (
	"log"
	"net/http"

	"eylexander/portfolio/backend/src/consts"

	"github.com/gorilla/mux"
)

// GetProjects retrieves all published projects, optionally filtered by locale
func (h *Handler) GetProjects(w http.ResponseWriter, r *http.Request) error {
	// Get locale from query parameter, default to empty (returns all locales)
	locale := r.URL.Query().Get("locale")

	projects, err := h.dataStore.GetProjects(locale)
	if err != nil {
		log.Printf("Error fetching projects: %v", err)
		return h.WriteError(w, http.StatusInternalServerError, "FETCH_ERROR", "Failed to fetch projects", err.Error())
	}

	if projects == nil {
		projects = []consts.Project{}
	}

	if err := h.WriteSuccess(w, projects); err != nil {
		log.Printf("Error writing projects response: %v", err)
		return err
	}
	return nil
}

// GetProjectBySlug retrieves a single project by slug and optional locale
func (h *Handler) GetProjectBySlug(w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	slug := vars["slug"]

	// Get locale from query parameter
	locale := r.URL.Query().Get("locale")

	if slug == "" {
		return h.WriteError(w, http.StatusBadRequest, "INVALID_SLUG", "Slug parameter is required", "")
	}

	project, err := h.dataStore.GetProjectBySlug(slug, locale)
	if err != nil {
		log.Printf("Error fetching project %s: %v", slug, err)
		return h.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Project not found", err.Error())
	}

	if err := h.WriteSuccess(w, project); err != nil {
		log.Printf("Error writing project response: %v", err)
		return err
	}
	return nil
}
