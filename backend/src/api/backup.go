package api

import (
	"eylexander/portfolio/backend/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (a *API) ExportBackup(c *gin.Context) {
	data, err := a.ctrl.ExportData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export data", "details": err.Error()})
	}

	c.JSON(http.StatusOK, data)
}

func (a *API) ImportBackup(c *gin.Context) {
	var input models.BackupData
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid backup data", "details": err.Error()})
		return
	}

	if err := a.ctrl.ImportData(c.Request.Context(), &input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore backup", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Backup restored successfully"})
}
