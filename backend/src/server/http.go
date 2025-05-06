package server

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"eylexander/portfolio/backend/src/api"
	"eylexander/portfolio/backend/src/ctrl"
)

func Start(address string, handler *api.Handler, controller *ctrl.Controller) {
	router := mux.NewRouter()

	// Log every request
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Printf("Received %s instruction on %s path.", r.Method, r.URL)
			next.ServeHTTP(w, r)
		})
	})

	// Handle CORS preflight requests
	router.Methods(http.MethodOptions).HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
	})

	// Create an API subrouter for all /api/v1 routes
	apiRouter := router.PathPrefix("/api/v1").Subrouter()

	// Define specific API routes
	apiRouter.HandleFunc("", wrapHandler(handler.DefaultLocation))
	apiRouter.HandleFunc("/debugger", wrapHandler(handler.StartDebugger))
	apiRouter.HandleFunc("/debugs", wrapHandler(handler.GetDebugs))

	// Set a NotFoundHandler for the API subrouter to handle undefined API routes
	apiRouter.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("API route not found: %s instruction on %s path.", r.Method, r.URL)
		handler.DefaultLocation(w, r)
	})

	webRouter := router.PathPrefix("/").Subrouter()

	webRouter.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Route not found: %s instruction on %s path.", r.Method, r.URL)
		handler.DefaultLocation(w, r)

		// Just forward to /frontend/index.html
		// http.ServeFile(w, r, "frontend/index.html")
	})

	log.Printf("Starting API server on http://%s/", address)

	http.ListenAndServe(address, router)
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

// func WriteJSON(w http.ResponseWriter, code int, data interface{}) error {
// 	w.Header().Set("Content-Type", "application/json")
// 	w.Header().Set("Access-Control-Allow-Origin", "*")
// 	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT,	 OPTIONS")
// 	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
// 	w.WriteHeader(code)
// 	return json.NewEncoder(w).Encode(data)
// }

// func WriteHTTP(w http.ResponseWriter, code int, data interface{}) error {
// 	w.Header().Set("Content-Type", "text/html")
// 	w.Header().Set("Access-Control-Allow-Origin", "*")
// 	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
// 	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
// 	w.WriteHeader(code)
// 	_, err := w.Write([]byte(data.(string)))
// 	return err
// }

// func writeEmptyResponse(w http.ResponseWriter, code int) error {
// 	w.Header().Set("Access-Control-Allow-Origin", "*")
// 	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
// 	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
// 	w.WriteHeader(code)
// 	return nil
// }

// func NewAPIServer(serverAddress string, store datastore.DataStore) *APIServer {
// 	return &APIServer{
// 		serverAddress: serverAddress,
// 		store:         store,
// 	}
// }

// func MakeHTTPHandler(fn APIFunc) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		if err := fn(w, r); err != nil {
// 			WriteJSON(w, http.StatusInternalServerError, APIError{Error: err.Error()})
// 		}
// 	}
// }

// func (s *APIServer) Start(handler *api.Handler, controller *ctrl.Controller) {
// 	router := mux.NewRouter()

// 	// Log every request
// 	router.Use(func(next http.Handler) http.Handler {
// 		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 			log.Printf("Received %s instruction on %s path.", r.Method, r.URL)
// 			next.ServeHTTP(w, r)
// 		})
// 	})

// 	// Handle CORS preflight requests
// 	router.Methods(http.MethodOptions).HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		w.Header().Set("Access-Control-Allow-Origin", "*")
// 		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
// 		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
// 		w.WriteHeader(http.StatusOK)
// 	})

// 	// Create an API subrouter for all /api/v1 routes
// 	apiRouter := router.PathPrefix("/api/v1").Subrouter()

// 	// Define specific API routes
// 	apiRouter.HandleFunc("", MakeHTTPHandler(s.DefaultAPILocation))
// 	apiRouter.HandleFunc("/debugger", MakeHTTPHandler(api.Handler.StartDebugger))
// 	apiRouter.HandleFunc("/debugs", MakeHTTPHandler(api.GetDebugs))

// 	// Set a NotFoundHandler for the API subrouter to handle undefined API routes
// 	apiRouter.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		log.Printf("API route not found: %s instruction on %s path.", r.Method, r.URL)
// 		s.DefaultAPILocation(w, r)
// 	})

// 	r := router.PathPrefix("/").Subrouter()

// 	r.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		log.Printf("Route not found: %s instruction on %s path.", r.Method, r.URL)
// 		s.DefaultLocation(w, r)
// 	})

// 	log.Printf("Starting API server on http://%s/", s.serverAddress)

// 	http.ListenAndServe(s.serverAddress, router)
// }

// func (s *APIServer) DefaultLocation(w http.ResponseWriter, r *http.Request) error {
// 	return WriteHTTP(w, http.StatusOK, "<p>Backend API Server</p>")
// }

// func (s *APIServer) DefaultAPILocation(w http.ResponseWriter, r *http.Request) error {
// 	return WriteHTTP(w, http.StatusOK, "<p>Backend API Server Documentation</p>")
// }
