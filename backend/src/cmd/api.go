package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func writeJSON(w http.ResponseWriter, code int, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT,	 OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(code)
	return json.NewEncoder(w).Encode(data)
}

func writeHTTP(w http.ResponseWriter, code int, data interface{}) error {
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

func newAPIServer(serverAddress string, store Storage) *APIServer {
	return &APIServer{
		serverAddress: serverAddress,
		store:         store,
	}
}

func makeHTTPHandler(fn APIFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := fn(w, r); err != nil {
			writeJSON(w, http.StatusInternalServerError, APIError{Error: err.Error()})
		}
	}
}

func (s *APIServer) start() {
	router := mux.NewRouter()

	router.Methods(http.MethodOptions).HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
	})

	router.HandleFunc("/", makeHTTPHandler(s.defaultLocation))
	router.HandleFunc("/api/v1/debugger", makeHTTPHandler(s.startDebugger))
	router.HandleFunc("/api/v1/debugs", makeHTTPHandler(s.getDebugs))

	router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received %s instruction on %s path.", r.Method, r.URL)
		s.defaultLocation(w, r)
	})

	log.Printf("Starting API server on http://%s/", s.serverAddress)

	http.ListenAndServe(s.serverAddress, router)
}

func (s *APIServer) defaultLocation(w http.ResponseWriter, r *http.Request) error {
	return writeHTTP(w, http.StatusOK, "<p>Backend API Server</p>")
}

// End Of Base Func

func (s *APIServer) startDebugger(w http.ResponseWriter, r *http.Request) error {
	response, err := s.store.doDebug()
	if err != nil {
		return err
	}

	if r.Method == "GET" {
		return s.getDebugger(w, r, response)
	}
	if r.Method == "POST" {
		return s.postDebugger(w, r)
	}
	return nil
}

func (s *APIServer) getDebugger(w http.ResponseWriter, _ *http.Request, m *storeResponse) error {
	return writeJSON(w, http.StatusOK, map[string]string{"message": "Get Debugger", "mongo": m.Message})
}

func (s *APIServer) postDebugger(w http.ResponseWriter, _ *http.Request) error {
	return writeJSON(w, http.StatusOK, map[string]string{"message": "Post Debugger"})
}

func (s *APIServer) getDebugs(w http.ResponseWriter, _ *http.Request) error {
	response, err := s.store.getDebugs()
	if err != nil {
		log.Printf("Error: %v", err)
	}

	return writeJSON(w, http.StatusOK, response)
}
