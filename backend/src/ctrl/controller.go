package ctrl

import (
	"eylexander/portfolio/backend/src/datastore"
)

type Controller struct {
	dataStore datastore.DataStore
}

func NewController(dataStore datastore.DataStore) *Controller {
	return &Controller{
		dataStore: dataStore,
	}
}

func (c *Controller) GetDataStore() datastore.DataStore {
	return c.dataStore
}
