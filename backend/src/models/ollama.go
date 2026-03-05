package models

type OllamaGenerateRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type OllamaGenerateResponse struct {
	Response string `json:"response"`
}

type OllamaModelInfo struct {
	Name string `json:"name"`
}

type OllamaTagsResponse struct {
	Models []OllamaModelInfo `json:"models"`
}
