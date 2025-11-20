package datastore

import (
	"context"
	"time"
)

// HealthCheck performs a health check on the MongoDB connection
func (s *MongoDBStore) HealthCheck() error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return s.client.Ping(ctx, nil)
}
