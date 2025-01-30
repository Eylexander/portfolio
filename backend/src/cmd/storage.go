package main

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

func newMongoDBStore(dbName string) (*MongoDBStore, error) {
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

	log.Printf("Connected to MongoDB")

	return &MongoDBStore{
		db: client.Database(dbName),
	}, nil
}

func (s *MongoDBStore) init() error {
	if err := s.db.CreateCollection(context.TODO(), "debug"); err != nil {
		return fmt.Errorf("failed to create debug collection: %w", err)
	}

	return nil
}

func (s *MongoDBStore) doDebug() (*storeResponse, error) {
	if _, err := s.db.Collection("debug").InsertOne(context.TODO(), map[string]string{"debug": "debug"}); err != nil {
		return nil, fmt.Errorf("failed to insert debug: %w", err)
	}

	return &storeResponse{Message: "debug"}, nil
}

func (s *MongoDBStore) getDebugs() ([]Debug, error) {
	cursor, err := s.db.Collection("debug").Find(context.Background(), bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to find debugs: %w", err)
	}
	defer cursor.Close(context.TODO())

	var debugs []Debug
	for cursor.Next(context.Background()) {
		var debug Debug
		if err := cursor.Decode(&debug); err != nil {
			return nil, fmt.Errorf("failed to decode debug: %w", err)
		}

		debugs = append(debugs, debug)
	}

	return debugs, nil
}
