package controller

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RunContactDigest emails a summary of contact messages received since the
// last digest, and marks them as notified. If there are no new messages, or
// SMTP/recipient isn't configured, it does nothing.
func (c *Controller) RunContactDigest(ctx context.Context) error {
	messages, err := c.ds.GetUnnotifiedContactMessages(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch unnotified contact messages: %w", err)
	}
	if len(messages) == 0 {
		return nil
	}

	to := os.Getenv("DIGEST_EMAIL_TO")
	if to == "" {
		return nil
	}

	subject := fmt.Sprintf("[Portfolio] %d new contact message(s)", len(messages))

	var body strings.Builder
	body.WriteString(fmt.Sprintf("You have %d new contact message(s) since the last digest:\n\n", len(messages)))
	for _, m := range messages {
		body.WriteString("----------------------------------------\n")
		body.WriteString(fmt.Sprintf("From:    %s <%s>\n", m.Name, m.Email))
		body.WriteString(fmt.Sprintf("Subject: %s\n", m.Subject))
		body.WriteString(fmt.Sprintf("Date:    %s\n\n", m.CreatedAt.Format(time.RFC1123)))
		body.WriteString(m.Message)
		body.WriteString("\n\n")
	}

	if err := sendEmail(to, subject, body.String()); err != nil {
		return fmt.Errorf("failed to send digest email: %w", err)
	}

	ids := make([]primitive.ObjectID, len(messages))
	for i, m := range messages {
		ids[i] = m.ID
	}
	return c.ds.MarkContactMessagesNotified(ctx, ids)
}

// StartDigestScheduler runs RunContactDigest on a recurring schedule
// (twice a week by default: Monday and Thursday at 09:00 server time),
// configurable via the DIGEST_DAYS ("0"=Sunday..."6"=Saturday, comma
// separated) and DIGEST_HOUR (0-23) environment variables. It stops when
// ctx is cancelled.
func (c *Controller) StartDigestScheduler(ctx context.Context) {
	days := parseDigestDays(os.Getenv("DIGEST_DAYS"))
	hour := parseDigestHour(os.Getenv("DIGEST_HOUR"))

	go func() {
		for {
			next := nextDigestTime(time.Now(), days, hour)
			timer := time.NewTimer(time.Until(next))

			select {
			case <-ctx.Done():
				timer.Stop()
				return
			case <-timer.C:
				if err := c.RunContactDigest(ctx); err != nil {
					log.Printf("contact digest failed: %v", err)
				}
			}
		}
	}()
}

func parseDigestDays(raw string) []time.Weekday {
	var days []time.Weekday
	for _, part := range strings.Split(raw, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		n, err := strconv.Atoi(part)
		if err != nil || n < 0 || n > 6 {
			continue
		}
		days = append(days, time.Weekday(n))
	}
	if len(days) == 0 {
		return []time.Weekday{time.Monday, time.Thursday}
	}
	return days
}

func parseDigestHour(raw string) int {
	h, err := strconv.Atoi(raw)
	if err != nil || h < 0 || h > 23 {
		return 9
	}
	return h
}

func nextDigestTime(from time.Time, days []time.Weekday, hour int) time.Time {
	for i := 0; i <= 7; i++ {
		candidate := time.Date(from.Year(), from.Month(), from.Day(), hour, 0, 0, 0, from.Location()).AddDate(0, 0, i)
		if !weekdayIn(days, candidate.Weekday()) {
			continue
		}
		if candidate.After(from) {
			return candidate
		}
	}
	return from.Add(24 * time.Hour)
}

func weekdayIn(days []time.Weekday, d time.Weekday) bool {
	for _, x := range days {
		if x == d {
			return true
		}
	}
	return false
}
