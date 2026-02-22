package api

import (
	"eylexander/portfolio/backend/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetArticles returns a list of visible articles
func (a *API) GetArticles(c *gin.Context) {
	articles, err := a.ctrl.GetArticles(c.Request.Context(), true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch articles"})
		return
	}
	c.JSON(http.StatusOK, articles)
}

// GetAdminArticles returns a list of all articles (including hidden)
func (a *API) GetAdminArticles(c *gin.Context) {
	articles, err := a.ctrl.GetArticles(c.Request.Context(), false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch articles"})
		return
	}
	c.JSON(http.StatusOK, articles)
}

// GetArticle returns a single article by slug
func (a *API) GetArticle(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Slug is required"})
		return
	}

	article, err := a.ctrl.GetArticleBySlug(c.Request.Context(), slug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch article"})
		return
	}
	if article == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	// Double check visibility if not authenticated (TODO: Add Auth check)
	// We can check gin context for user
	_, isAuthenticated := c.Get("username")
	if !article.IsVisible && !isAuthenticated {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	c.JSON(http.StatusOK, article)
}

// CreateArticle handles new article creation
func (a *API) CreateArticle(c *gin.Context) {
	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := a.ctrl.CreateArticle(c.Request.Context(), &article); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create article"})
		return
	}

	c.JSON(http.StatusCreated, article)
}

// UpdateArticle handles article updates
func (a *API) UpdateArticle(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Ensure ID from URL matches object (or set it)
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	article.ID = objID // Force ID from URL

	if err := a.ctrl.UpdateArticle(c.Request.Context(), &article); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update article"})
		return
	}

	c.JSON(http.StatusOK, article)
}

// DeleteArticle handles deletions
func (a *API) DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	if err := a.ctrl.DeleteArticle(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete article"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article deleted"})
}
