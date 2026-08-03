package main

import (
	"context"
	"log"
	"os"
	"time"

	"eylexander/portfolio/backend/src/datastore"
	"eylexander/portfolio/backend/src/server"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}
	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {
		dbName = "portfolio"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// Initialize MongoDB datastore
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ds, err := datastore.NewMongoDatastore(ctx, mongoURI, dbName)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer ds.Close(context.Background())

	log.Println("Successfully connected to MongoDB")

	// Initialize and start server
	srv := server.NewServer(ds)
	srv.StartBackgroundJobs(context.Background())

	// Initialize Admin User if provided
	adminUser := os.Getenv("ADMIN_USERNAME")
	adminPass := os.Getenv("ADMIN_PASSWORD")
	err = ds.CreateAdminUser(ctx, adminUser, adminPass)
	if err != nil {
		log.Printf("Admin user setup skipped or failed: %v", err)
	} else {
		log.Printf("Admin user '%s' verified/initialized successfully", adminUser)
	}

	log.Printf("Portfolio Server starting on port %s...\n", port)
	if err := srv.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
