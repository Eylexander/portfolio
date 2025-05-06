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
	db *mongo.Database
}

func NewMongoDBStore(dbName string) *MongoDBStore {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	uri := os.Getenv("MONGODB_URI")
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
		db: client.Database(dbName),
	}
}

func (s *MongoDBStore) Init() error {
	// Check if the "debug" collection exists
	collections, err := s.db.ListCollectionNames(context.TODO(), bson.M{"name": "debug"})
	if err != nil {
		return fmt.Errorf("failed to list collections: %w", err)
	}

	// Create the collection if it doesn't exist
	if len(collections) == 0 {
		if err := s.db.CreateCollection(context.TODO(), "debug"); err != nil {
			return fmt.Errorf("failed to create debug collection: %w", err)
		}
	}

	return nil
}
