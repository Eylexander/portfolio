package controller

import (
	"context"
	"encoding/json"
	"eylexander/portfolio/backend/src/models"
	"log"

	_ "embed"

	"go.mongodb.org/mongo-driver/mongo"
)

//go:embed about_default.json
var defaultAboutJSON []byte

func (c *Controller) GetAboutData(ctx context.Context) (*models.AboutData, error) {
	data, err := c.ds.GetAboutData(ctx)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Return default empty data if not found, loaded from easily modifiable JSON file
			var defaultData models.AboutData
			if err := json.Unmarshal(defaultAboutJSON, &defaultData); err != nil {
				log.Printf("Error unmarshaling default about data: %v", err)
				return nil, err
			}
			return &defaultData, nil
		}
		return nil, err
	}
	return data, nil
}

func (c *Controller) UpdateAboutData(ctx context.Context, data *models.AboutData) error {
	return c.ds.UpdateAboutData(ctx, data)
}
