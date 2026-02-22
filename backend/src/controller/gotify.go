package controller

import (
	"fmt"
	"os"

	"github.com/go-resty/resty/v2"
)

func sendGotifyNotification(title, message string) error {
	gotifyURL := os.Getenv("GOTIFY_URL")
	gotifyToken := os.Getenv("GOTIFY_TOKEN")

	if gotifyURL == "" || gotifyToken == "" {
		// Gotify not configured, skip notification
		return nil
	}

	client := resty.New()
	resp, err := client.R().
		SetHeader("X-Gotify-Key", gotifyToken).
		SetBody(map[string]interface{}{
			"title":    title,
			"message":  message,
			"priority": 5,
		}).
		Post(fmt.Sprintf("%s/message", gotifyURL))

	if err != nil {
		return fmt.Errorf("failed to send gotify notification: %w", err)
	}

	if resp.IsError() {
		return fmt.Errorf("gotify returned error status: %s", resp.Status())
	}

	return nil
}
