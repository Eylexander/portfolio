package models

type Settings struct {
	OllamaModel string `json:"ollama_model" bson:"ollama_model"`
}
