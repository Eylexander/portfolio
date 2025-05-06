package datastore

import (
	"context"
	"eylexander/portfolio/backend/src/consts"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
)

func (s *MongoDBStore) DoDebug() (*consts.StoreResponse, error) {
	if _, err := s.db.Collection("debug").InsertOne(context.TODO(), map[string]string{"debug": "debug"}); err != nil {
		return nil, fmt.Errorf("failed to insert debug: %w", err)
	}

	return &consts.StoreResponse{Message: "debug"}, nil
}

func (s *MongoDBStore) GetDebugs() ([]consts.Debug, error) {
	cursor, err := s.db.Collection("debug").Find(context.Background(), bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to find debugs: %w", err)
	}
	defer cursor.Close(context.TODO())

	var debugs []consts.Debug
	for cursor.Next(context.Background()) {
		var debug consts.Debug
		if err := cursor.Decode(&debug); err != nil {
			return nil, fmt.Errorf("failed to decode debug: %w", err)
		}

		debugs = append(debugs, debug)
	}

	return debugs, nil
}
