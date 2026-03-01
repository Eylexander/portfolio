package datastore

import (
	"context"
	"eylexander/portfolio/backend/src/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (m *MongoDatastore) GetAboutData(ctx context.Context) (*models.AboutData, error) {
	collection := m.db.Collection("about")

	var data models.AboutData
	err := collection.FindOne(ctx, bson.M{}).Decode(&data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func (m *MongoDatastore) UpdateAboutData(ctx context.Context, data *models.AboutData) error {
	collection := m.db.Collection("about")

	opts := options.Replace().SetUpsert(true)
	_, err := collection.ReplaceOne(ctx, bson.M{}, data, opts)
	return err
}
