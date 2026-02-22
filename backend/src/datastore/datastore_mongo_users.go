package datastore

import (
	"context"
	"eylexander/portfolio/backend/src/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func (ds *MongoDatastore) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := ds.db.Collection("users").FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Return nil, nil if not found
		}
		return nil, err
	}
	return &user, nil
}

func (ds *MongoDatastore) CreateUser(ctx context.Context, user *models.User) error {
	res, err := ds.db.Collection("users").InsertOne(ctx, user)
	if err != nil {
		return err
	}
	user.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}

func (ds *MongoDatastore) CreateAdminUser(ctx context.Context, username, password string) error {
	if username == "" || password == "" {
		return nil
	}

	// Check if user already exists
	existing, err := ds.GetUserByUsername(ctx, username)
	if err != nil {
		return err
	}
	if existing != nil {
		return nil
	}

	// Check if any users exist (should be zero for first admin creation)
	count, err := ds.CountUsers(ctx)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := &models.User{
		Username: username,
		Password: string(hashedPassword),
	}

	return ds.CreateUser(ctx, user)
}

func (ds *MongoDatastore) UpdateUser(ctx context.Context, user *models.User) error {
	_, err := ds.db.Collection("users").UpdateOne(
		ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{
			"username": user.Username,
			"password": user.Password,
		}},
	)
	return err
}

func (ds *MongoDatastore) CountUsers(ctx context.Context) (int64, error) {
	return ds.db.Collection("users").CountDocuments(ctx, bson.M{})
}
