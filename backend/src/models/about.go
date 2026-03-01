package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Experience struct {
	ID          string          `bson:"id" json:"id"`
	Role        LocalizedString `bson:"role" json:"role"`
	Company     string          `bson:"company" json:"company"`
	Period      LocalizedString `bson:"period" json:"period"`
	Description LocalizedString `bson:"description" json:"description"`
}

type StackItem struct {
	ID       string `bson:"id" json:"id"`
	Name     string `bson:"name" json:"name"`
	Category string `bson:"category" json:"category"`
	URL      string `bson:"url" json:"url"`
}

type AboutData struct {
	ID                     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title                  LocalizedString    `bson:"title" json:"title"`
	Description            LocalizedString    `bson:"description" json:"description"`
	ExperienceTitle        LocalizedString    `bson:"experience_title" json:"experience_title"`
	Experiences            []Experience       `bson:"experiences" json:"experiences"`
	AssociativeTitle       LocalizedString    `bson:"associative_title" json:"associative_title"`
	AssociativeExperiences []Experience       `bson:"associative_experiences" json:"associative_experiences"`
	StackTools             []StackItem        `bson:"stack_tools" json:"stack_tools"`
}
