package controller

import (
	"context"
	"eylexander/portfolio/backend/src/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetArticles retrieves a list of articles. If visibleOnly is true, only public articles are returned.
func (c *Controller) GetArticles(ctx context.Context, visibleOnly bool) ([]*models.Article, error) {
	return c.ds.GetArticles(ctx, visibleOnly)
}

// GetArticleBySlug retrieves a single article by its slug.
func (c *Controller) GetArticleBySlug(ctx context.Context, slug string) (*models.Article, error) {
	return c.ds.GetArticleBySlug(ctx, slug)
}

// CreateArticle creates a new article
func (c *Controller) CreateArticle(ctx context.Context, article *models.Article) error {
	// Generate slug if empty (basic implementation, improved later)
	if article.Slug == "" {
		article.Slug = article.Title.En // You might want a proper slugify function library
	}
	return c.ds.CreateArticle(ctx, article)
}

// UpdateArticle updates an existing article
func (c *Controller) UpdateArticle(ctx context.Context, article *models.Article) error {
	return c.ds.UpdateArticle(ctx, article)
}

// DeleteArticle deletes an article by ID
func (c *Controller) DeleteArticle(ctx context.Context, idHex string) error {
	oid, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		return err
	}
	return c.ds.DeleteArticle(ctx, oid)
}
