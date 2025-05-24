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
}
