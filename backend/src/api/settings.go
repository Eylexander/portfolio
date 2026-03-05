package api

import (
	"eylexander/portfolio/backend/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (a *API) GetSettings(c *gin.Context) {
	settings, err := a.ctrl.GetSettings(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get settings"})
		return
	}
	c.JSON(http.StatusOK, settings)
}

func (a *API) UpdateSettings(c *gin.Context) {
	var settings models.Settings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := a.ctrl.UpdateSettings(c.Request.Context(), &settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, settings)
}
