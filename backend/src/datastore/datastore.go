package datastore

import (
	"context"
	"eylexander/portfolio/backend/src/models"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// DataStore defines the interface for database operations
type DataStore interface {
	Close(ctx context.Context) error
	Ping(ctx context.Context) error

	// Articles
	CreateArticle(ctx context.Context, article *models.Article) error
	GetArticles(ctx context.Context, onlyVisible bool) ([]*models.Article, error)
	GetArticleBySlug(ctx context.Context, slug string) (*models.Article, error)
	UpdateArticle(ctx context.Context, article *models.Article) error
	DeleteArticle(ctx context.Context, id primitive.ObjectID) error

	// Contact
	CreateContactMessage(ctx context.Context, msg *models.ContactMessage) error
	GetLastContactMessageTime(ctx context.Context, ip string) (time.Time, error)
	GetContactMessages(ctx context.Context) ([]*models.ContactMessage, error)
	DeleteContactMessage(ctx context.Context, id primitive.ObjectID) error

	// Auth
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
	CreateUser(ctx context.Context, user *models.User) error
	CreateAdminUser(ctx context.Context, username, password string) error
	UpdateUser(ctx context.Context, user *models.User) error
	CountUsers(ctx context.Context) (int64, error)

	// About
	GetAboutData(ctx context.Context) (*models.AboutData, error)
	UpdateAboutData(ctx context.Context, data *models.AboutData) error

	// Settings
	GetSettings(ctx context.Context) (*models.Settings, error)
	UpdateSettings(ctx context.Context, settings *models.Settings) error

	// Backup
	RestoreBackup(ctx context.Context, data *models.BackupData) error
}
