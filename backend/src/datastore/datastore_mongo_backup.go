package datastore

import (
	"context"
	"eylexander/portfolio/backend/src/models"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func (m *MongoDatastore) RestoreBackup(ctx context.Context, data *models.BackupData) error {
	// Start by restoring articles
	if data.Articles != nil {
		_, err := m.db.Collection("articles").DeleteMany(ctx, bson.M{})
		if err != nil {
			log.Printf("Error clearing articles: %v", err)
			return err
		}
		if len(data.Articles) > 0 {
			var docs []interface{}
			for _, article := range data.Articles {
				docs = append(docs, article)
			}
			_, err = m.db.Collection("articles").InsertMany(ctx, docs)
			if err != nil {
				log.Printf("Error inserting articles: %v", err)
				return err
			}
		}
	}

	// Restore about data
	if data.About != nil {
		_, err := m.db.Collection("about").DeleteMany(ctx, bson.M{})
		if err != nil {
			log.Printf("Error clearing about data: %v", err)
			return err
		}
		_, err = m.db.Collection("about").InsertOne(ctx, data.About)
		if err != nil {
			log.Printf("Error inserting about data: %v", err)
			return err
		}
	}

	// Restore messages
	if data.Messages != nil {
		_, err := m.db.Collection("contact").DeleteMany(ctx, bson.M{})
		if err != nil {
			log.Printf("Error clearing messages: %v", err)
			return err
		}
		if len(data.Messages) > 0 {
			var docs []interface{}
			for _, msg := range data.Messages {
				docs = append(docs, msg)
			}
			_, err = m.db.Collection("contact").InsertMany(ctx, docs)
			if err != nil {
				log.Printf("Error inserting messages: %v", err)
				return err
			}
		}
	}

	return nil
}
