package datastore

import (
	"context"
	"eylexander/portfolio/backend/src/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (ds *MongoDatastore) CreateArticle(ctx context.Context, article *models.Article) error {
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()
	res, err := ds.db.Collection("articles").InsertOne(ctx, article)
	if err != nil {
		return err
	}
	article.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}

func (ds *MongoDatastore) GetArticles(ctx context.Context, onlyVisible bool) ([]*models.Article, error) {
	filter := bson.M{}
	if onlyVisible {
		filter["is_visible"] = true
	}

	opts := options.Find().SetSort(bson.D{{Key: "project_date", Value: -1}, {Key: "created_at", Value: -1}})
	cursor, err := ds.db.Collection("articles").Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []*models.Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (ds *MongoDatastore) GetArticleBySlug(ctx context.Context, slug string) (*models.Article, error) {
	var article models.Article
	err := ds.db.Collection("articles").FindOne(ctx, bson.M{"slug": slug}).Decode(&article)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &article, nil
}

func (ds *MongoDatastore) UpdateArticle(ctx context.Context, article *models.Article) error {
	article.UpdatedAt = time.Now()
	filter := bson.M{"_id": article.ID}
	update := bson.M{"$set": article}

	_, err := ds.db.Collection("articles").UpdateOne(ctx, filter, update)
	return err
}

func (ds *MongoDatastore) DeleteArticle(ctx context.Context, id primitive.ObjectID) error {
	_, err := ds.db.Collection("articles").DeleteOne(ctx, bson.M{"_id": id})
	return err
}
