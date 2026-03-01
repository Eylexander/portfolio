package api

import (
	"eylexander/portfolio/backend/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (a *API) GetAboutData(c *gin.Context) {
	data, err := a.ctrl.GetAboutData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get about data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

func (a *API) UpdateAboutData(c *gin.Context) {
	var data models.AboutData
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := a.ctrl.UpdateAboutData(c.Request.Context(), &data); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update about data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}
