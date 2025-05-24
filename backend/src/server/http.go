package server

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"eylexander/portfolio/backend/src/api"
	"eylexander/portfolio/backend/src/ctrl"
)

func Start(address string, handler *api.Handler, controller *ctrl.Controller) {
	router := mux.NewRouter()

	// Add middleware stack
	router.Use(loggingMiddleware)
	router.Use(corsMiddleware)
	router.Use(timeoutMiddleware(30 * time.Second))

	// Create an API subrouter for all /api/v1 routes
	apiRouter := router.PathPrefix("/api/v1").Subrouter()

	// Define specific API routes with proper HTTP methods
	apiRouter.HandleFunc("", wrapHandler(handler.DefaultLocation)).Methods("GET")
	apiRouter.HandleFunc("/health", wrapHandler(handler.HealthCheck)).Methods("GET")

	// Debug endpoints
	apiRouter.HandleFunc("/debugger", wrapHandler(handler.StartDebugger)).Methods("GET", "POST")
	apiRouter.HandleFunc("/debugs", wrapHandler(handler.GetDebugs)).Methods("GET")

	// Set a NotFoundHandler for the API subrouter to handle undefined API routes
	apiRouter.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("API route not found: %s instruction on %s path.", r.Method, r.URL)
		handler.WriteError(w, http.StatusNotFound, "ROUTE_NOT_FOUND",
			"API endpoint not found", "The requested API endpoint does not exist")
	})

	webRouter := router.PathPrefix("/").Subrouter()

	webRouter.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Route not found: %s instruction on %s path.", r.Method, r.URL)
		handler.DefaultLocation(w, r)
	})

	log.Printf("Starting API server on http://%s/", address)

	server := &http.Server{
		Handler:      router,
		Addr:         address,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Fatal(server.ListenAndServe())
}

// wrapHandler converts a handler that returns an error to a standard http.HandlerFunc
func wrapHandler(fn func(http.ResponseWriter, *http.Request) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := fn(w, r); err != nil {
			log.Printf("Error handling request: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
	}
}
