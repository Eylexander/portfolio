package datastore

import (
	"eylexander/portfolio/backend/src/consts"
)

type DataStore interface {

	// Health check
	HealthCheck() error

	// Debugger
	DoDebug() (*consts.StoreResponse, error)
	GetDebugs() ([]consts.Debug, error)

	// Projects
	GetProjects(locale string) ([]consts.Project, error)
	GetProjectBySlug(slug string, locale string) (*consts.Project, error)
	GetProjectsReduced(locale string) ([]consts.ProjectReduced, error)
	GetProjectBySlugReduced(slug string, locale string) (*consts.ProjectReduced, error)
}
