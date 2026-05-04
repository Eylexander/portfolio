package api

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"eylexander/portfolio/backend/src/models"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func (a *API) ExportBackup(c *gin.Context) {
	data, err := a.ctrl.ExportData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export data", "details": err.Error()})
		return
	}

	// Create a zip archive buffer
	buf := new(bytes.Buffer)
	zipWriter := zip.NewWriter(buf)

	// 1. Add backup.json
	jsonData, err := json.Marshal(data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal JSON"})
		return
	}

	jsonFile, err := zipWriter.Create("backup.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create json in zip"})
		return
	}
	_, err = jsonFile.Write(jsonData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write json to zip"})
		return
	}

	// 2. Add uploads
	uploadDir := "uploads"
	files, err := os.ReadDir(uploadDir)
	if err == nil {
		for _, f := range files {
			if !f.IsDir() {
				filePath := filepath.Join(uploadDir, f.Name())
				fileData, err := os.ReadFile(filePath)
				if err != nil {
					continue
				}
				zipFile, err := zipWriter.Create("uploads/" + f.Name())
				if err == nil {
					zipFile.Write(fileData)
				}
			}
		}
	}

	err = zipWriter.Close()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to finalize zip file"})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=backup.zip")
	c.Data(http.StatusOK, "application/zip", buf.Bytes())
}

func (a *API) ImportBackup(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No backup file provided"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open uploaded file"})
		return
	}
	defer src.Close()

	fileBytes, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read uploaded file"})
		return
	}

	zipReader, err := zip.NewReader(bytes.NewReader(fileBytes), int64(len(fileBytes)))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read zip file", "details": err.Error()})
		return
	}

	var input models.BackupData
	var foundJson bool

	for _, f := range zipReader.File {
		if f.Name == "backup.json" {
			rc, err := f.Open()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open backup.json from zip"})
				return
			}
			jsonBytes, err := io.ReadAll(rc)
			rc.Close()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read backup.json"})
				return
			}

			if err := json.Unmarshal(jsonBytes, &input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid backup data", "details": err.Error()})
				return
			}
			foundJson = true
		} else if len(f.Name) > 8 && f.Name[:8] == "uploads/" {
			// Extract upload files
			rc, err := f.Open()
			if err != nil {
				continue
			}

			uploadDir := "uploads"
			os.MkdirAll(uploadDir, os.ModePerm)
			fileName := filepath.Join(uploadDir, filepath.Base(f.Name))
			
			destFile, err := os.Create(fileName)
			if err == nil {
				io.Copy(destFile, rc)
				destFile.Close()
			}
			rc.Close()
		}
	}

	if !foundJson {
		c.JSON(http.StatusBadRequest, gin.H{"error": "backup.json not found in zip archive"})
		return
	}

	if err := a.ctrl.ImportData(c.Request.Context(), &input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore backup database", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Backup restored successfully"})
}
