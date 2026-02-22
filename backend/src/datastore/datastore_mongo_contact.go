package datastore

import (
	"context"
	"errors"
	"eylexander/portfolio/backend/src/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (ds *MongoDatastore) CreateContactMessage(ctx context.Context, msg *models.ContactMessage) error {
	msg.CreatedAt = time.Now()
	res, err := ds.db.Collection("messages").InsertOne(ctx, msg)
	if err != nil {
		return err
	}
	msg.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}

func (ds *MongoDatastore) GetLastContactMessageTime(ctx context.Context, ip string) (time.Time, error) {
	opts := options.FindOne().SetSort(bson.D{{Key: "created_at", Value: -1}})
	var msg models.ContactMessage
	err := ds.db.Collection("messages").FindOne(ctx, bson.M{"ip_address": ip}, opts).Decode(&msg)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return time.Time{}, nil
		}
		return time.Time{}, err
	}
	return msg.CreatedAt, nil
}

func (ds *MongoDatastore) GetContactMessages(ctx context.Context) ([]*models.ContactMessage, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := ds.db.Collection("messages").Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var messages []*models.ContactMessage
	if err := cursor.All(ctx, &messages); err != nil {
		return nil, err
	}
	return messages, nil
}

func (ds *MongoDatastore) DeleteContactMessage(ctx context.Context, id primitive.ObjectID) error {
	_, err := ds.db.Collection("messages").DeleteOne(ctx, bson.M{"_id": id})
	return err
}
