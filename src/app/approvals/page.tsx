"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { approvals } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const typeCounts = [
  { label: "Inventory Adjustments", count: 8 },
  { label: "Purchase Orders", count: 5 },
  { label: "Price Changes", count: 3 },
  { label: "Refunds", count: 2 },
  { label: "Supplier Requests", count: 4 },
];

export default function ApprovalsPage() {
  const [items, setItems] = useState(approvals);

  function decide(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Approvals"
        description="Centralized inbox for high-impact operational decisions"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {typeCounts.map((t) => (
          <GlassCard key={t.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold">{t.count}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <SurfaceCard className="py-16 text-center">
            <p className="font-semibold">No pending approvals</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              All requests in your queue are resolved.
            </p>
          </SurfaceCard>
        ) : (
          items.map((a) => (
            <SurfaceCard key={a.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[var(--text-primary)]">
                      {a.title}
                    </h2>
                    <Pill
                      tone={
                        a.risk === "high"
                          ? "danger"
                          : a.risk === "medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {a.risk} risk
                    </Pill>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {a.id} · Requested by {a.requestedBy} · {a.date}
                  </p>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    {a.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs">
                    <span>
                      <span className="text-[var(--text-muted)]">
                        Financial impact:{" "}
                      </span>
                      <span className="font-medium">
                        {a.financialImpact === 0
                          ? "—"
                          : formatCurrency(Math.abs(a.financialImpact))}
                      </span>
                    </span>
                    <span>
                      <span className="text-[var(--text-muted)]">
                        Inventory:{" "}
                      </span>
                      <span className="font-medium">{a.inventoryImpact}</span>
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => decide(a.id)}
                  >
                    Request Changes
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => decide(a.id)}
                  >
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => decide(a.id)}>
                    Approve
                  </Button>
                </div>
              </div>
            </SurfaceCard>
          ))
        )}
      </div>
    </div>
  );
}
