package controller

import (
	"context"
	"errors"
	"eylexander/portfolio/backend/src/models"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// SubmitContactMessage processes a new contact message with rate limiting.
func (c *Controller) SubmitContactMessage(ctx context.Context, msg *models.ContactMessage) error {
	// Spam protection: if honeypot field is filled, silently ignore
	if msg.Honeypot != "" {
		return nil
	}

	const minTimeBetweenMessages = 5 * time.Minute

	lastTime, err := c.ds.GetLastContactMessageTime(ctx, msg.IPAddress)
	if err != nil {
		return err
	}

	if !lastTime.IsZero() && time.Since(lastTime) < minTimeBetweenMessages {
		return errors.New("rate limit exceeded: please wait before sending another message")
	}

	err = c.ds.CreateContactMessage(ctx, msg)
	if err != nil {
		return err
	}

	// Send Gotify notification
	title := fmt.Sprintf("[Portfolio] Msg from %s", msg.Name)
	body := fmt.Sprintf("Email: %s\nSubject: %s\n\n%s", msg.Email, msg.Subject, msg.Message)
	go func() {
		if notifyErr := sendGotifyNotification(title, body); notifyErr != nil {
			fmt.Printf("Failed to send Gotify notification: %v\n", notifyErr)
		}
	}()

	return nil
}

// GetContactMessages retrieves all contact messages.
func (c *Controller) GetContactMessages(ctx context.Context) ([]*models.ContactMessage, error) {
	return c.ds.GetContactMessages(ctx)
}

// DeleteContactMessage deletes a contact message by ID.
func (c *Controller) DeleteContactMessage(ctx context.Context, idHex string) error {
	oid, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		return err
	}
	return c.ds.DeleteContactMessage(ctx, oid)
}
