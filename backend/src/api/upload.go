package api

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const maxRemoteImageBytes = 15 * 1024 * 1024 // 15MB

var extByContentType = map[string]string{
	"image/jpeg":    ".jpg",
	"image/png":     ".png",
	"image/gif":     ".gif",
	"image/webp":    ".webp",
	"image/svg+xml": ".svg",
	"image/avif":    ".avif",
}

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

// UploadFromURL downloads an externally-hosted image and re-saves it locally,
// so content never keeps a dependency on a third-party host.
func (a *API) UploadFromURL(c *gin.Context) {
	var body struct {
		URL string `json:"url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A valid url is required"})
		return
	}

	parsed, err := url.Parse(body.URL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only http(s) URLs are supported"})
		return
	}

	if err := ensurePublicHost(parsed.Hostname()); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL host is not allowed"})
		return
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(parsed.String())
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch image"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch image"})
		return
	}

	contentType := strings.SplitN(resp.Header.Get("Content-Type"), ";", 2)[0]
	contentType = strings.TrimSpace(contentType)
	ext, ok := extByContentType[contentType]
	if !ok {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"error": "URL does not point to a supported image type"})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	destPath := filepath.Join(uploadDir, filename)

	dest, err := os.Create(destPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}
	defer dest.Close()

	if _, err := io.Copy(dest, io.LimitReader(resp.Body, maxRemoteImageBytes+1)); err != nil {
		os.Remove(destPath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	if info, err := os.Stat(destPath); err == nil && info.Size() > maxRemoteImageBytes {
		os.Remove(destPath)
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "Image is too large"})
		return
	}

	localURL := fmt.Sprintf("/api/v1/uploads/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": localURL})
}

// ensurePublicHost rejects hostnames that resolve to loopback, private, or
// link-local addresses to prevent the server from being used to reach internal services.
func ensurePublicHost(hostname string) error {
	ips, err := net.LookupIP(hostname)
	if err != nil {
		return err
	}
	for _, ip := range ips {
		if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsUnspecified() {
			return fmt.Errorf("host resolves to a disallowed address")
		}
	}
	return nil
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

func (a *API) DeleteUpload(c *gin.Context) {
	filename := c.Param("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Filename is required"})
		return
	}

	filepath := filepath.Join("uploads", filename)

	// Check if file exists
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// Delete file
	if err := os.Remove(filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
}
