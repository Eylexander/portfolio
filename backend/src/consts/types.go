package consts

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Global Types

type Debug struct {
	ID    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Debug string             `json:"debug"`
}

// Health check types

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Database  string    `json:"database"`
	Version   string    `json:"version"`
}

// Storage Types

type StoreResponse struct {
	Message string `json:"message"`
}

// Project Types

type ProjectLocale struct {
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
	Content     string `json:"content" bson:"content"`
}

type Project struct {
	ID         primitive.ObjectID       `json:"id" bson:"_id,omitempty"`
	Slug       string                   `json:"slug" bson:"slug"`
	Locales    map[string]ProjectLocale `json:"locales" bson:"locales"`
	Date       *time.Time               `json:"date,omitempty" bson:"date,omitempty"`
	Published  bool                     `json:"published" bson:"published"`
	URL        string                   `json:"url,omitempty" bson:"url,omitempty"`
	Repository string                   `json:"repository,omitempty" bson:"repository,omitempty"`
	Position   int                      `json:"position,omitempty" bson:"position,omitempty"`
}
