package api

import (
	"eylexander/portfolio/backend/src/ctrl"
	"eylexander/portfolio/backend/src/datastore"
)

type Handler struct {
	dataStore datastore.DataStore
	ctrl      *ctrl.Controller
}

func NewHandler(dataStore datastore.DataStore, ctrl *ctrl.Controller) *Handler {
	return &Handler{
		dataStore: dataStore,
		ctrl:      ctrl,
	}
}
