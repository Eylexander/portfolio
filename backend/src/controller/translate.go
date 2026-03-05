package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"eylexander/portfolio/backend/src/models"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type OllamaGenerateRequest = models.OllamaGenerateRequest
type OllamaGenerateResponse = models.OllamaGenerateResponse
type OllamaModelInfo = models.OllamaModelInfo
type OllamaTagsResponse = models.OllamaTagsResponse

func (c *Controller) GetOllamaConfig() (url string, model string) {
	url = os.Getenv("OLLAMA_URL")
	model = os.Getenv("OLLAMA_MODEL")

	// Verify datastore overrides
	settings, err := c.ds.GetSettings(context.Background())
	if err == nil && settings != nil {
		if settings.OllamaModel != "" {
			model = settings.OllamaModel
		}
	}
	return url, model
}

func (c *Controller) IsOllamaConfigured() bool {
	url, model := c.GetOllamaConfig()
	return url != "" && model != ""
}

func (c *Controller) Translate(ctx context.Context, text, sourceLang, targetLang string) (string, error) {
	if !c.IsOllamaConfigured() {
		return "", errors.New("Ollama is not configured")
	}

	url, model := c.GetOllamaConfig()

	prompt := fmt.Sprintf(
		"Translate the following text from %s to %s.\n"+
			"Rules:\n"+
			"- Output ONLY the translated text, no explanations or surrounding quotes.\n"+
			"- Preserve ALL Markdown formatting exactly: headings (#), bold (**), italic (*), lists (-, *), blockquotes (>), tables, horizontal rules (---), and line breaks.\n"+
			"- Do NOT translate or alter fenced code blocks (``` or `), inline code (`), URLs, image paths, or HTML tags — copy them verbatim.\n"+
			"- Keep the same paragraph structure and blank lines.\n\n%s",
		sourceLang, targetLang, text,
	)

	reqBody := OllamaGenerateRequest{
		Model:  model,
		Prompt: prompt,
		Stream: false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url+"/api/generate", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Ollama API failed with status %d: %s", resp.StatusCode, string(body))
	}

	var resData OllamaGenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&resData); err != nil {
		return "", err
	}

	return resData.Response, nil
}

func (c *Controller) GetOllamaModels(ctx context.Context) ([]string, error) {
	url := os.Getenv("OLLAMA_URL")
	if url == "" {
		return nil, errors.New("Ollama URL is not configured")
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url+"/api/tags", nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Ollama API failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tagsResp OllamaTagsResponse
	if err := json.NewDecoder(resp.Body).Decode(&tagsResp); err != nil {
		return nil, err
	}

	models := make([]string, len(tagsResp.Models))
	for i, m := range tagsResp.Models {
		models[i] = m.Name
	}
	return models, nil
}
