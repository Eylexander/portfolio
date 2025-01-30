package main

import (
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// API Types

type APIFunc func(w http.ResponseWriter, r *http.Request) error

type APIError struct {
	Error string `json:"message"`
}

type APIServer struct {
	serverAddress string
	store         Storage
}

// Storage Types

type Storage interface {
	doDebug() (*storeResponse, error)
	getDebugs() ([]Debug, error)
}

type MongoDBStore struct {
	db *mongo.Database
}

type storeResponse struct {
	Message string `json:"message"`
}

// Global Types

type Debug struct {
	ID    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Debug string             `json:"debug"`
}
