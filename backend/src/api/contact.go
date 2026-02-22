package api

import (
	"eylexander/portfolio/backend/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// SubmitContact handles contact form submissions
func (a *API) SubmitContact(c *gin.Context) {
	var msg models.ContactMessage
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Basic validation
	if msg.Name == "" || msg.Email == "" || msg.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, email and message are required"})
		return
	}

	if len(msg.Name) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is too long (max 100 characters)"})
		return
	}

	if len(msg.Email) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is too long (max 100 characters)"})
		return
	}

	if len(msg.Subject) > 200 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subject is too long (max 200 characters)"})
		return
	}

	if len(msg.Message) > 5000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message is too long (max 5000 characters)"})
		return
	}

	// Get IP for rate limiting
	msg.IPAddress = c.ClientIP()

	if err := a.ctrl.SubmitContactMessage(c.Request.Context(), &msg); err != nil {
		// Differentiate between rate limit and internal error?
		if err.Error() == "rate limit exceeded: please wait before sending another message" {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit message"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Message sent successfully"})
}

// GetContactMessages returns a list of all contact messages
func (a *API) GetContactMessages(c *gin.Context) {
	messages, err := a.ctrl.GetContactMessages(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}
	c.JSON(http.StatusOK, messages)
}

// DeleteContactMessage handles deletions of contact messages
func (a *API) DeleteContactMessage(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	if err := a.ctrl.DeleteContactMessage(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message deleted"})
}
