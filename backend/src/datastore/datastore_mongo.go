package datastore

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDatastore struct {
	client *mongo.Client
	db     *mongo.Database
}

func NewMongoDatastore(ctx context.Context, uri, dbName string) (*MongoDatastore, error) {
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	return &MongoDatastore{
		client: client,
		db:     client.Database(dbName),
	}, nil
}

func (m *MongoDatastore) Close(ctx context.Context) error {
	return m.client.Disconnect(ctx)
}

func (m *MongoDatastore) Ping(ctx context.Context) error {
	return m.client.Ping(ctx, nil)
}
