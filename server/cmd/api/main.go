package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"miniso/server/internal/db"
	"miniso/server/internal/httpapi"
)

func main() {
	loadEnv(".env")
	loadEnv("../.env")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	log.Printf("connecting to postgres")
	pool, err := db.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	log.Printf("migrating")
	if err := db.Migrate(ctx, pool); err != nil {
		log.Fatal(err)
	}
	if os.Getenv("RESEED") == "1" {
		log.Printf("RESEED=1 — clearing tables for a fresh org seed")
		if err := db.Reset(ctx, pool); err != nil {
			log.Fatal(err)
		}
	}
	log.Printf("seeding")
	if err := db.Seed(ctx, pool); err != nil {
		log.Fatal(err)
	}

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}
	server := &httpapi.Server{DB: pool, Secret: os.Getenv("JWT_SECRET")}
	if server.Secret == "" {
		server.Secret = "miniso-retail-os-dev"
	}
	log.Printf("miniso api listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, server.Handler()))
}

func loadEnv(path string) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for _, line := range strings.Split(string(raw), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok || os.Getenv(key) != "" {
			continue
		}
		_ = os.Setenv(key, value)
	}
}
