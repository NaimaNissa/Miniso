"use client";

import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { useRetail } from "@/components/retail-provider";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function ControlCenterPage() {
  const { networkStats, stores, warehouses, ready } = useRetail();
  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Control Center"
        description="Global → country → city → store network view"
      />

      <GlassCard className="relative overflow-hidden p-6">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(228,59,59,0.12), transparent 40%), radial-gradient(circle at 70% 60%, rgba(101,118,216,0.1), transparent 35%)",
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="accent">🇧🇩 Bangladesh</Pill>
            <Pill tone="neutral">Drill-down ready</Pill>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Country network</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Stores</p>
              <p className="text-2xl font-semibold">{networkStats.stores}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Warehouses</p>
              <p className="text-2xl font-semibold">
                {networkStats.warehouses}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Inventory</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(networkStats.inventory)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Sales today</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(networkStats.salesToday)}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {stores.map((s) => (
              <Link key={s.id} href={`/stores/${s.id}`}>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--accent)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  {s.name}
                </span>
              </Link>
            ))}
            {warehouses.map((w) => (
              <Link key={w.id} href="/warehouse">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--info)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--info)]" />
                  {w.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Store
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--info)]" /> Warehouse
              / DC
            </span>
          </div>
        </div>
      </GlassCard>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SurfaceCard className="p-5">
          <h3 className="text-sm font-semibold">Exception queue</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              "24 SKUs out of stock across network",
              "1 warehouse count discrepancy — Zone B",
              "Late inbound on PO-2026-00482",
              "2 stores below 90% stock availability",
            ].map((e) => (
              <li
                key={e}
                className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2"
              >
                {e}
              </li>
            ))}
          </ul>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <h3 className="text-sm font-semibold">Hierarchy</h3>
          <ol className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            <li>Global HQ</li>
            <li className="pl-3">→ Bangladesh</li>
            <li className="pl-6">→ Dhaka</li>
            <li className="pl-9 font-medium text-[var(--accent)]">
              → Dhanmondi Store
            </li>
          </ol>
        </SurfaceCard>
      </div>
    </div>
  );
}
