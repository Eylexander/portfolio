package main

import (
	"fmt"
	"log"

	"eylexander/portfolio/backend/src/ctrl"
	"eylexander/portfolio/backend/src/server"
)

func main() {
	addr := "0.0.0.0"
	port := 8000
	dbName := "Portfolio"

	address := fmt.Sprintf("%s:%d", addr, port)

	store, err := ctrl.NewMongoDBStore(dbName)
	if err != nil {
		log.Fatal(err)
	}

	if err := store.Init(); err != nil {
		log.Fatal(err)
	}

	server := server.NewAPIServer(address, store)
	server.Start()
}
