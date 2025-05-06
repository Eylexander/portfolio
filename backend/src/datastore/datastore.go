package datastore

import (
	"eylexander/portfolio/backend/src/consts"
)

type DataStore interface {

	// Debugger
	DoDebug() (*consts.StoreResponse, error)
	GetDebugs() ([]consts.Debug, error)
}
