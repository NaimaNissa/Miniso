package httpapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"
)

func appBaseURL() string {
	if v := strings.TrimSpace(os.Getenv("APP_URL")); v != "" {
		return strings.TrimRight(v, "/")
	}
	if v := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_APP_URL")); v != "" {
		return strings.TrimRight(v, "/")
	}
	return "http://localhost:3000"
}

func mailFrom() string {
	if v := strings.TrimSpace(os.Getenv("SMTP_FROM")); v != "" {
		return v
	}
	if v := strings.TrimSpace(os.Getenv("MAIL_FROM")); v != "" {
		return v
	}
	return "MINISO Retail OS <noreply@miniso.bd>"
}

type mailResult struct {
	Status string // sent | queued_local | failed
	Error  string
}

func sendInviteEmail(to, inviteeName, roleLabel, inviterName, inviteURL, workspace string) mailResult {
	subject := "You're invited to MINISO Retail OS"
	body := buildInviteEmailBody(inviteeName, roleLabel, inviterName, inviteURL, workspace)

	if key := strings.TrimSpace(os.Getenv("RESEND_API_KEY")); key != "" {
		if err := sendViaResend(key, to, subject, body); err != nil {
			log.Printf("invite email resend failed to %s: %v", to, err)
			return mailResult{Status: "failed", Error: err.Error()}
		}
		return mailResult{Status: "sent"}
	}

	host := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	if host != "" {
		if err := sendViaSMTP(host, to, subject, body); err != nil {
			log.Printf("invite email smtp failed to %s: %v", to, err)
			return mailResult{Status: "failed", Error: err.Error()}
		}
		return mailResult{Status: "sent"}
	}

	log.Printf("invite email queued locally → %s\nSubject: %s\n%s", to, subject, body)
	return mailResult{Status: "queued_local"}
}

func buildInviteEmailBody(inviteeName, roleLabel, inviterName, inviteURL, workspace string) string {
	hello := "Hello,"
	if strings.TrimSpace(inviteeName) != "" {
		hello = "Hello " + strings.TrimSpace(inviteeName) + ","
	}
	ws := workspace
	if ws == "" {
		ws = "MINISO Bangladesh"
	}
	return fmt.Sprintf(`%s

%s invited you to join MINISO Retail OS as %s for %s.

Accept your invitation and choose a password here:
%s

This link expires in 7 days. After you sign up you will land on your role dashboard.

— MINISO Retail OS
`, hello, inviterName, roleLabel, ws, inviteURL)
}

func sendViaResend(apiKey, to, subject, body string) error {
	payload, _ := json.Marshal(map[string]any{
		"from":    mailFrom(),
		"to":      []string{to},
		"subject": subject,
		"text":    body,
	})
	req, err := http.NewRequest(http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 20 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(res.Body)
	if res.StatusCode >= 300 {
		return fmt.Errorf("resend %d: %s", res.StatusCode, strings.TrimSpace(string(raw)))
	}
	return nil
}

func sendViaSMTP(host, to, subject, body string) error {
	port := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	if port == "" {
		port = "587"
	}
	user := strings.TrimSpace(os.Getenv("SMTP_USER"))
	pass := os.Getenv("SMTP_PASS")
	fromHeader := mailFrom()
	fromAddr := extractEmail(fromHeader)
	addr := net.JoinHostPort(host, port)

	msg := strings.Join([]string{
		"From: " + fromHeader,
		"To: " + to,
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")

	var auth smtp.Auth
	if user != "" {
		auth = smtp.PlainAuth("", user, pass, host)
	}
	return smtp.SendMail(addr, auth, fromAddr, []string{to}, []byte(msg))
}

func extractEmail(from string) string {
	from = strings.TrimSpace(from)
	if i := strings.LastIndex(from, "<"); i >= 0 {
		j := strings.LastIndex(from, ">")
		if j > i {
			return strings.TrimSpace(from[i+1 : j])
		}
	}
	return from
}
