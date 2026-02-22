package api

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func (a *API) UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

	// Create uploads directory if it doesn't exist
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filepath := filepath.Join(uploadDir, filename)

	// Save the file
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	// Return the URL
	url := fmt.Sprintf("/api/v1/uploads/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": url})
}

func (a *API) ListUploads(c *gin.Context) {
	uploadDir := "uploads"
	files, err := os.ReadDir(uploadDir)
	if err != nil {
		if os.IsNotExist(err) {
			c.JSON(http.StatusOK, []string{})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read uploads directory"})
		return
	}

	var urls []string
	for _, f := range files {
		if !f.IsDir() {
			urls = append(urls, fmt.Sprintf("/api/v1/uploads/%s", f.Name()))
		}
	}

	// Return empty array instead of null if no files
	if urls == nil {
		urls = []string{}
	}

	c.JSON(http.StatusOK, urls)
}
