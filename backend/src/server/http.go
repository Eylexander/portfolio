package server

import (
	"encoding/json"
	"eylexander/portfolio/backend/src/ctrl"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func WriteJSON(w http.ResponseWriter, code int, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT,	 OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(code)
	return json.NewEncoder(w).Encode(data)
}

func WriteHTTP(w http.ResponseWriter, code int, data interface{}) error {
	w.Header().Set("Content-Type", "text/html")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(code)
	_, err := w.Write([]byte(data.(string)))
	return err
}

// func writeEmptyResponse(w http.ResponseWriter, code int) error {
// 	w.Header().Set("Access-Control-Allow-Origin", "*")
// 	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
// 	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
// 	w.WriteHeader(code)
// 	return nil
// }

func NewAPIServer(serverAddress string, store ctrl.Storage) *APIServer {
	return &APIServer{
		serverAddress: serverAddress,
		store:         store,
	}
}

func MakeHTTPHandler(fn APIFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := fn(w, r); err != nil {
			WriteJSON(w, http.StatusInternalServerError, APIError{Error: err.Error()})
		}
	}
}

func (s *APIServer) Start() {
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
	apiRouter.HandleFunc("", MakeHTTPHandler(s.DefaultAPILocation))
	apiRouter.HandleFunc("/debugger", MakeHTTPHandler(s.StartDebugger))
	apiRouter.HandleFunc("/debugs", MakeHTTPHandler(s.GetDebugs))

	// Set a NotFoundHandler for the API subrouter to handle undefined API routes
	apiRouter.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("API route not found: %s instruction on %s path.", r.Method, r.URL)
		s.DefaultAPILocation(w, r)
	})

	r := router.PathPrefix("/").Subrouter()

	r.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Route not found: %s instruction on %s path.", r.Method, r.URL)
		s.DefaultLocation(w, r)
	})

	// Handle root path
	// router.HandleFunc("/", MakeHTTPHandler(s.DefaultLocation))

	// Set default NotFoundHandler for any other route
	// router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 	log.Printf("Route not found: %s instruction on %s path.", r.Method, r.URL)
	// 	s.DefaultLocation(w, r)
	// })

	// router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 	log.Printf("Route not found: %s instruction on %s path.", r.Method, r.URL)
	// 	_ = s.DefaultLocation(w, r)
	// })

	log.Printf("Starting API server on http://%s/", s.serverAddress)

	http.ListenAndServe(s.serverAddress, router)
}

func (s *APIServer) DefaultLocation(w http.ResponseWriter, r *http.Request) error {
	return WriteHTTP(w, http.StatusOK, "<p>Backend API Server</p>")
}

func (s *APIServer) DefaultAPILocation(w http.ResponseWriter, r *http.Request) error {
	return WriteHTTP(w, http.StatusOK, "<p>Backend API Server Documentation</p>")
}

// End Of Base Func

func (s *APIServer) StartDebugger(w http.ResponseWriter, r *http.Request) error {
	response, err := s.store.DoDebug()
	if err != nil {
		return err
	}

	if r.Method == "GET" {
		return s.GetDebugger(w, r, response)
	}
	if r.Method == "POST" {
		return s.PostDebugger(w, r)
	}
	return nil
}

func (s *APIServer) GetDebugger(w http.ResponseWriter, _ *http.Request, m *ctrl.StoreResponse) error {
	return WriteJSON(w, http.StatusOK, map[string]string{"message": "Get Debugger", "mongo": m.Message})
}

func (s *APIServer) PostDebugger(w http.ResponseWriter, _ *http.Request) error {
	return WriteJSON(w, http.StatusOK, map[string]string{"message": "Post Debugger"})
}

func (s *APIServer) GetDebugs(w http.ResponseWriter, _ *http.Request) error {
	response, err := s.store.GetDebugs()
	if err != nil {
		log.Printf("Error: %v", err)
	}

	return WriteJSON(w, http.StatusOK, response)
}
