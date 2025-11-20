package datastore

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDBStore struct {
	db     *mongo.Database
	client *mongo.Client
}

func NewMongoDBStore(dbName string) *MongoDBStore {
	if err := godotenv.Load(); err != nil {
		log.Println("No local .env file found")
	}

	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017"
	}

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		panic(err)
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Connected to MongoDB at %s", uri)

	return &MongoDBStore{
		db:     client.Database(dbName),
		client: client,
	}
}

func (s *MongoDBStore) Init() error {
	// Check if the "debug" collection exists
	collections, err := s.db.ListCollectionNames(context.TODO(), bson.M{"name": "debug"})
	if err != nil {
		return fmt.Errorf("failed to list collections: %w", err)
	}

	// Create the debug collection if it doesn't exist
	if len(collections) == 0 {
		if err := s.db.CreateCollection(context.TODO(), "debug"); err != nil {
			return fmt.Errorf("failed to create debug collection: %w", err)
		}
	}

	// Check if the "projects" collection exists
	collections, err = s.db.ListCollectionNames(context.TODO(), bson.M{"name": "projects"})
	if err != nil {
		return fmt.Errorf("failed to list collections: %w", err)
	}

	// Create the projects collection if it doesn't exist
	if len(collections) == 0 {
		if err := s.db.CreateCollection(context.TODO(), "projects"); err != nil {
			return fmt.Errorf("failed to create projects collection: %w", err)
		}
	}

	return nil
}
