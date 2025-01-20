package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/mgo.v2/bson"
)

type Storage interface {
	doDebug() (*storeResponse, error)
	getTodoList() ([]Todo, error)
	addTodoList(todo Todo) error
	deleteTodoList(id string) error
	updateTodoList(id string, todo Todo) error
}

type MongoDBStore struct {
	db *mongo.Client
}

type storeResponse struct {
	Message string `json:"message"`
}

func newMongoDBStore() (*MongoDBStore, error) {
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
		db: client,
	}, nil
}

func (s *MongoDBStore) init() error {
	db := s.db.Database("VirtuBackend")

	// Create the users Database
	if err := db.CreateCollection(context.TODO(), "todos"); err != nil {
		return fmt.Errorf("failed to create users collection: %w", err)
	}

	// Create the debug Collection
	if err := db.CreateCollection(context.TODO(), "debug"); err != nil {
		return fmt.Errorf("failed to create debug collection: %w", err)
	}

	return nil
}

func (s *MongoDBStore) doDebug() (*storeResponse, error) {
	s.db.Database("VirtuBackend").Collection("debug").InsertOne(context.TODO(), map[string]string{"debug": "debug"})
	return &storeResponse{Message: "debug"}, nil
}

func (s *MongoDBStore) getTodoList() ([]Todo, error) {
	var todos []Todo
	cursor, err := s.db.Database("VirtuBackend").Collection("todos").Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var todo Todo
		if err := cursor.Decode(&todo); err != nil {
			return nil, err
		}
		todos = append(todos, todo)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return todos, nil
}

func (s *MongoDBStore) addTodoList(todo Todo) error {
	_, err := s.db.Database("VirtuBackend").Collection("todos").InsertOne(context.TODO(), todo)
	return err
}

func (s *MongoDBStore) deleteTodoList(id string) error {
	_, err := s.db.Database("VirtuBackend").Collection("todos").DeleteOne(context.TODO(), map[string]string{"id": id})
	return err
}

func (s *MongoDBStore) updateTodoList(id string, todo Todo) error {
	update := bson.M{
		"$set": todo,
	}
	_, err := s.db.Database("VirtuBackend").Collection("todos").UpdateOne(context.TODO(), bson.M{"id": id}, update)
	return err
}
