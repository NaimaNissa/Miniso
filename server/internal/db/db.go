package db

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(ctx context.Context) (*pgxpool.Pool, error) {
	url := os.Getenv("DATABASE_PUBLIC_URL")
	if url == "" {
		url = os.Getenv("DATABASE_URL")
	}
	if url == "" {
		return nil, fmt.Errorf("DATABASE_PUBLIC_URL is not set")
	}
	if !strings.Contains(url, "sslmode=") {
		if strings.Contains(url, "?") {
			url += "&sslmode=require"
		} else {
			url += "?sslmode=require"
		}
	}
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	if _, err := pool.Exec(ctx, schemaSQL); err != nil {
		return err
	}
	// Existing Railway DBs already have base tables; add org columns safely.
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS headquarters (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			country TEXT NOT NULL,
			city TEXT NOT NULL DEFAULT '',
			owner_user_id TEXT
		);
		ALTER TABLE stores ADD COLUMN IF NOT EXISTS manager_user_id TEXT;
		ALTER TABLE stores ADD COLUMN IF NOT EXISTS hq_id TEXT;
		ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS hq_id TEXT;
		ALTER TABLE staff ADD COLUMN IF NOT EXISTS manager_user_id TEXT;
		ALTER TABLE adjustments ADD COLUMN IF NOT EXISTS store_id TEXT;
		ALTER TABLE adjustments ADD COLUMN IF NOT EXISTS product_id TEXT;
		ALTER TABLE adjustments ADD COLUMN IF NOT EXISTS location_kind TEXT NOT NULL DEFAULT 'store';
		ALTER TABLE approvals ADD COLUMN IF NOT EXISTS promotion_id TEXT;
		ALTER TABLE approvals ADD COLUMN IF NOT EXISTS requester_user_id TEXT;
		ALTER TABLE approvals ADD COLUMN IF NOT EXISTS branch_id TEXT;
		ALTER TABLE approvals ADD COLUMN IF NOT EXISTS decided_by TEXT;
		ALTER TABLE approvals ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
		ALTER TABLE approvals ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;
		CREATE TABLE IF NOT EXISTS invites (
			id TEXT PRIMARY KEY,
			token TEXT UNIQUE NOT NULL,
			email TEXT NOT NULL,
			role TEXT NOT NULL,
			title TEXT NOT NULL DEFAULT '',
			position TEXT NOT NULL DEFAULT '',
			name TEXT NOT NULL DEFAULT '',
			branch_id TEXT,
			warehouse_id TEXT,
			invited_by TEXT NOT NULL,
			invited_by_name TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'pending',
			email_status TEXT NOT NULL DEFAULT 'pending',
			email_error TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			expires_at TIMESTAMPTZ NOT NULL,
			accepted_at TIMESTAMPTZ,
			accepted_user_id TEXT
		);
		CREATE INDEX IF NOT EXISTS invites_email_idx ON invites (email);
		CREATE INDEX IF NOT EXISTS invites_status_idx ON invites (status);
	`)
	return err
}
