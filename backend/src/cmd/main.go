package main

import (
	"fmt"
	"log"
)

func main() {
	addr := "0.0.0.0"
	port := 8000
	dbName := "Portfolio"

	address := fmt.Sprintf("%s:%d", addr, port)

	store, err := newMongoDBStore(dbName)
	if err != nil {
		log.Fatal(err)
	}

	if err := store.init(); err != nil {
		log.Fatal(err)
	}

	server := newAPIServer(address, store)
	server.start()
}
