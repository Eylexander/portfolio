package controller

import (
	"context"
	"eylexander/portfolio/backend/src/models"
)

func (c *Controller) GetSettings(ctx context.Context) (*models.Settings, error) {
	return c.ds.GetSettings(ctx)
}

func (c *Controller) UpdateSettings(ctx context.Context, settings *models.Settings) error {
	return c.ds.UpdateSettings(ctx, settings)
}
