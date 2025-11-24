package datastore

import (
	"context"
	"fmt"
	"time"

	"eylexander/portfolio/backend/src/consts"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetProjects retrieves all published projects from MongoDB, optionally filtered by locale
func (s *MongoDBStore) GetProjects(locale string) ([]consts.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := s.db.Collection("projects")

	// Build filter - always filter for published
	filter := bson.M{"published": true}

	// If locale is provided, only return projects that have that locale
	if locale != "" {
		filter[fmt.Sprintf("locales.%s", locale)] = bson.M{"$exists": true}
	}

	// Sort by date descending (newest first)
	opts := options.Find().SetSort(bson.M{"date": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects: %w", err)
	}
	defer cursor.Close(ctx)

	var projects []consts.Project
	if err = cursor.All(ctx, &projects); err != nil {
		return nil, fmt.Errorf("failed to decode projects: %w", err)
	}

	// If locale is specified, filter to only include that locale's data
	if locale != "" {
		for i, project := range projects {
			if localeData, exists := project.Locales[locale]; exists {
				// Keep only the requested locale
				projects[i].Locales = map[string]consts.ProjectLocale{
					locale: localeData,
				}
			}
		}
	}

	return projects, nil
}

// GetProjectsReduced retrieves all published projects with reduced data (no content field)
func (s *MongoDBStore) GetProjectsReduced(locale string) ([]consts.ProjectReduced, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := s.db.Collection("projects")

	// Build filter - always filter for published
	filter := bson.M{"published": true}

	// If locale is provided, only return projects that have that locale
	if locale != "" {
		filter[fmt.Sprintf("locales.%s", locale)] = bson.M{"$exists": true}
	}

	// Sort by date descending (newest first)
	opts := options.Find().SetSort(bson.M{"date": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects: %w", err)
	}
	defer cursor.Close(ctx)

	var projects []consts.Project
	if err = cursor.All(ctx, &projects); err != nil {
		return nil, fmt.Errorf("failed to decode projects: %w", err)
	}

	// Convert to reduced projects
	reducedProjects := make([]consts.ProjectReduced, len(projects))
	for i, project := range projects {
		reducedProjects[i] = consts.ProjectReduced{
			ID:       project.ID,
			Slug:     project.Slug,
			Date:     project.Date,
			Position: project.Position,
			Locales:  make(map[string]consts.ProjectReducedLocale),
		}

		// Add only title and description for each locale
		if locale != "" {
			if localeData, exists := project.Locales[locale]; exists {
				reducedProjects[i].Locales[locale] = consts.ProjectReducedLocale{
					Title:       localeData.Title,
					Description: localeData.Description,
				}
			}
		} else {
			// Include all locales if none specified
			for loc, localeData := range project.Locales {
				reducedProjects[i].Locales[loc] = consts.ProjectReducedLocale{
					Title:       localeData.Title,
					Description: localeData.Description,
				}
			}
		}
	}

	return reducedProjects, nil
}

// GetProjectBySlug retrieves a single published project by slug, filtered by locale if provided
func (s *MongoDBStore) GetProjectBySlug(slug string, locale string) (*consts.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := s.db.Collection("projects")

	filter := bson.M{
		"slug":      slug,
		"published": true,
	}

	// If locale is provided, only match if that locale exists in the document
	if locale != "" {
		filter[fmt.Sprintf("locales.%s", locale)] = bson.M{"$exists": true}
	}

	var project consts.Project
	err := collection.FindOne(ctx, filter).Decode(&project)
	if err != nil {
		return nil, fmt.Errorf("failed to find project: %w", err)
	}

	// If locale is specified, filter to only include that locale's data
	if locale != "" {
		if localeData, exists := project.Locales[locale]; exists {
			project.Locales = map[string]consts.ProjectLocale{
				locale: localeData,
			}
		}
	}

	return &project, nil
}

// GetProjectBySlugReduced retrieves a single published project by slug with reduced data (no content field)
func (s *MongoDBStore) GetProjectBySlugReduced(slug string, locale string) (*consts.ProjectReduced, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := s.db.Collection("projects")

	filter := bson.M{
		"slug":      slug,
		"published": true,
	}

	// If locale is provided, only match if that locale exists in the document
	if locale != "" {
		filter[fmt.Sprintf("locales.%s", locale)] = bson.M{"$exists": true}
	}

	var project consts.Project
	err := collection.FindOne(ctx, filter).Decode(&project)
	if err != nil {
		return nil, fmt.Errorf("failed to find project: %w", err)
	}

	// Convert to reduced project
	reduced := &consts.ProjectReduced{
		ID:       project.ID,
		Slug:     project.Slug,
		Date:     project.Date,
		Position: project.Position,
		Locales:  make(map[string]consts.ProjectReducedLocale),
	}

	// Add only title and description for each locale
	if locale != "" {
		if localeData, exists := project.Locales[locale]; exists {
			reduced.Locales[locale] = consts.ProjectReducedLocale{
				Title:       localeData.Title,
				Description: localeData.Description,
			}
		}
	} else {
		// Include all locales if none specified
		for loc, localeData := range project.Locales {
			reduced.Locales[loc] = consts.ProjectReducedLocale{
				Title:       localeData.Title,
				Description: localeData.Description,
			}
		}
	}

	return reduced, nil
}
