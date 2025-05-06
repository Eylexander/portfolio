package ctrl

import (
	"eylexander/portfolio/backend/src/consts"

	"go.mongodb.org/mongo-driver/mongo"
)

type Storage interface {
	DoDebug() (*StoreResponse, error)
	GetDebugs() ([]consts.Debug, error)
}

type MongoDBStore struct {
	db *mongo.Database
}

type StoreResponse struct {
	Message string `json:"message"`
}
