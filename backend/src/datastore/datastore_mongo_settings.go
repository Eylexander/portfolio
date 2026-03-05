package datastore

import (
	"context"
	"eylexander/portfolio/backend/src/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (m *MongoDatastore) GetSettings(ctx context.Context) (*models.Settings, error) {
	var settings models.Settings
	err := m.db.Collection("settings").FindOne(ctx, bson.M{"_id": "global_settings"}).Decode(&settings)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return &models.Settings{}, nil
		}
		return nil, err
	}
	return &settings, nil
}

func (m *MongoDatastore) UpdateSettings(ctx context.Context, settings *models.Settings) error {
	opts := options.Update().SetUpsert(true)
	update := bson.M{
		"$set": settings,
	}
	_, err := m.db.Collection("settings").UpdateOne(ctx, bson.M{"_id": "global_settings"}, update, opts)
	return err
}
