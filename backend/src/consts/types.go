package consts

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Global Types

type Debug struct {
	ID    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Debug string             `json:"debug"`
}

// Storage Types

type StoreResponse struct {
	Message string `json:"message"`
}
