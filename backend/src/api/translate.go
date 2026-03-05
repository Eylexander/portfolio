package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type TranslateRequest struct {
	Text       string `json:"text"`
	SourceLang string `json:"source_lang"`
	TargetLang string `json:"target_lang"`
}

type TranslateResponse struct {
	TranslatedText string `json:"translated_text"`
}

func (a *API) IsTranslateConfigured(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"configured": a.ctrl.IsOllamaConfigured()})
}

func (a *API) Translate(c *gin.Context) {
	var req TranslateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	translatedText, err := a.ctrl.Translate(c.Request.Context(), req.Text, req.SourceLang, req.TargetLang)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Translation failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, TranslateResponse{TranslatedText: translatedText})
}

func (a *API) GetOllamaModels(c *gin.Context) {
	models, err := a.ctrl.GetOllamaModels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get Ollama models: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"models": models})
}
