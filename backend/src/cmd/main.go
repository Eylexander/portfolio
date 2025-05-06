package main

import (
	"fmt"
	"log"

	"eylexander/portfolio/backend/src/api"
	"eylexander/portfolio/backend/src/ctrl"
	"eylexander/portfolio/backend/src/datastore"
	"eylexander/portfolio/backend/src/server"
)

func main() {
	addr := "0.0.0.0"
	port := 8000
	dbName := "Portfolio"

	address := fmt.Sprintf("%s:%d", addr, port)

	store := datastore.NewMongoDBStore(dbName)

	if err := store.Init(); err != nil {
		log.Fatal(err)
	}

	controller := ctrl.NewController(store)

	handler := api.NewHandler(store, controller)

	server.Start(address, handler, controller)
}
