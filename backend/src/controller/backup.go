package controller

import (
	"context"
	"eylexander/portfolio/backend/src/models"
)

func (c *Controller) ExportData(ctx context.Context) (*models.BackupData, error) {
	articles, err := c.ds.GetArticles(ctx, false) // false means get all (visible and hidden)
	if err != nil {
		return nil, err
	}

	about, err := c.GetAboutData(ctx)
	if err != nil {
		return nil, err
	}

	messages, err := c.ds.GetContactMessages(ctx)
	if err != nil {
		return nil, err
	}

	return &models.BackupData{
		Articles: articles,
		About:    about,
		Messages: messages,
	}, nil
}

func (c *Controller) ImportData(ctx context.Context, data *models.BackupData) error {
	// Let's use the new datastore method to restore all data natively
	return c.ds.RestoreBackup(ctx, data)
}
