package controller

import (
	"eylexander/portfolio/backend/src/datastore"
)

type Controller struct {
	ds datastore.DataStore
}

func NewController(ds datastore.DataStore) *Controller {
	return &Controller{ds: ds}
}
