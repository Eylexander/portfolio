package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type APIFunc func(w http.ResponseWriter, r *http.Request) error

type APIError struct {
	Error string `json:"message"`
}

type APIServer struct {
	serverAddress string
	store         Storage
}

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

func writeEmptyResponse(w http.ResponseWriter, code int) error {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(code)
	return nil
}

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

	router.HandleFunc("/api/v1/getTodosList", makeHTTPHandler(s.getTodoList))
	router.HandleFunc("/api/v1/addTodo", makeHTTPHandler(s.addTodoList)).Methods("POST")
	router.HandleFunc("/api/v1/deleteTodo/{id}", makeHTTPHandler(s.deleteTodo)).Methods("DELETE")
	router.HandleFunc("/api/v1/updateTodo/{id}", makeHTTPHandler(s.updateTodo)).Methods("PUT")

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

func (s *APIServer) getTodoList(w http.ResponseWriter, _ *http.Request) error {
	response, err := s.store.getTodoList()
	if err != nil {
		log.Printf("Error: %v", err)
	}

	return writeJSON(w, http.StatusOK, response)
}

func (s *APIServer) addTodoList(w http.ResponseWriter, r *http.Request) error {
	if r.Method != "POST" {
		return writeJSON(w, http.StatusMethodNotAllowed, APIError{Error: "Method not allowed"})
	} else {
		var todo Todo
		var requestData struct {
			Name string `json:"name"`
		}
		if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
			return writeJSON(w, http.StatusBadRequest, APIError{Error: "Invalid request payload"})
		}
		todo.Title = requestData.Name
		todo.Completed = false
		todo.ID = fmt.Sprintf("%d", time.Now().Unix())

		if err := s.store.addTodoList(todo); err != nil {
			return err
		}

		return writeJSON(w, http.StatusCreated, todo)
	}
}

func (s *APIServer) deleteTodo(w http.ResponseWriter, r *http.Request) error {
	if r.Method != "DELETE" {
		return writeJSON(w, http.StatusMethodNotAllowed, APIError{Error: "Method not allowed"})
	} else {
		vars := mux.Vars(r)
		id := vars["id"]

		if err := s.store.deleteTodoList(id); err != nil {
			return err
		}

		return writeEmptyResponse(w, http.StatusNoContent)
	}
}

func (s *APIServer) updateTodo(w http.ResponseWriter, r *http.Request) error {
	if r.Method != "PUT" {
		return writeJSON(w, http.StatusMethodNotAllowed, APIError{Error: "Method not allowed"})
	} else {
		var todo Todo
		vars := mux.Vars(r)
		id := vars["id"]

		var requestData struct {
			Title     string `json:"title"`
			Completed bool   `json:"completed"`
		}
		if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
			return writeJSON(w, http.StatusBadRequest, APIError{Error: "Invalid request payload"})
		}
		todo.ID = id
		todo.Title = requestData.Title
		todo.Completed = requestData.Completed

		if err := s.store.updateTodoList(id, todo); err != nil {
			return err
		}

		return writeEmptyResponse(w, http.StatusNoContent)
	}
}
