package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Reset clears seeded business tables so Seed can reload the full org graph.
func Reset(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		TRUNCATE TABLE
			sale_lines,
			sales,
			punches,
			leaves,
			staff,
			social_messages,
			conversations,
			customers,
			operation_tasks,
			warehouse_tasks,
			approvals,
			adjustments,
			transfers,
			shipments,
			purchase_orders,
			stock,
			products,
			promotions,
			branch_notes,
			series_points,
			hourly_sales,
			invites,
			users,
			stores,
			warehouses,
			headquarters
		RESTART IDENTITY CASCADE`)
	return err
}
