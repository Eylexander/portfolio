package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type LocalizedString struct {
	En string `bson:"en-US" json:"en-US"`
	Fr string `bson:"fr-FR" json:"fr-FR"`
}

type Article struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       LocalizedString    `bson:"title" json:"title"`
	Slug        string             `bson:"slug" json:"slug"`
	Content     LocalizedString    `bson:"content" json:"content"` // Markdown content
	Snippet     LocalizedString    `bson:"snippet" json:"snippet"`
	CoverImage  string             `bson:"cover_image" json:"cover_image"`
	Tags        []string           `bson:"tags" json:"tags"`
	IsVisible      bool               `bson:"is_visible" json:"is_visible"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
	ProjectDate    time.Time          `bson:"project_date" json:"project_date"`
	ProjectEndDate *time.Time         `bson:"project_end_date,omitempty" json:"project_end_date,omitempty"`
}

type ContactMessage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	Subject   string             `bson:"subject" json:"subject"`
	Message   string             `bson:"message" json:"message"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	IPAddress string             `bson:"ip_address" json:"-"` // Internal use for rate limiting
	Honeypot  string             `bson:"-" json:"website"`    // Honeypot field for spam protection
}

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username string             `bson:"username" json:"username"`
	Password string             `bson:"password" json:"-"`
}
