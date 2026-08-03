package controller

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

// sendEmail sends a plain-text email using SMTP settings from the environment.
// The authenticated user is also used as the From address, since submission
// servers (e.g. Mailu) typically require them to match.
// It silently no-ops if SMTP isn't configured, mirroring sendGotifyNotification.
func sendEmail(to, subject, body string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")

	if host == "" || port == "" || username == "" {
		return nil
	}

	addr := fmt.Sprintf("%s:%s", host, port)
	msg := buildEmailMessage(username, to, subject, body)
	auth := smtp.PlainAuth("", username, password, host)

	// Port 465 uses implicit TLS; net/smtp.SendMail only handles STARTTLS (587/25).
	if port == "465" {
		return sendEmailImplicitTLS(addr, host, auth, username, to, msg)
	}

	return smtp.SendMail(addr, auth, username, []string{to}, msg)
}

func buildEmailMessage(from, to, subject, body string) []byte {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("From: %s\r\n", from))
	sb.WriteString(fmt.Sprintf("To: %s\r\n", to))
	sb.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	sb.WriteString("MIME-Version: 1.0\r\n")
	sb.WriteString("Content-Type: text/plain; charset=\"utf-8\"\r\n")
	sb.WriteString("\r\n")
	sb.WriteString(body)
	return []byte(sb.String())
}

func sendEmailImplicitTLS(addr, host string, auth smtp.Auth, from, to string, msg []byte) error {
	conn, err := tls.Dial("tcp", addr, &tls.Config{ServerName: host})
	if err != nil {
		return fmt.Errorf("failed to dial smtp server: %w", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("failed to create smtp client: %w", err)
	}
	defer client.Close()

	if auth != nil {
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth failed: %w", err)
		}
	}
	if err := client.Mail(from); err != nil {
		return err
	}
	if err := client.Rcpt(to); err != nil {
		return err
	}
	w, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := w.Write(msg); err != nil {
		return err
	}
	return w.Close()
}
