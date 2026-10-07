"use client";

import { use } from "react";
import Link from "next/link";
import { stores, storeOperations } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const store = stores.find((s) => s.id === id);
  if (!store) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Store not found</p>
        <Link href="/stores" className="mt-2 inline-block text-sm text-[var(--accent)]">
          Back to stores
        </Link>
      </div>
    );
  }

  const kpis = [
    { label: "Today's Sales", value: formatCurrency(store.salesToday) },
    { label: "Transactions", value: String(store.transactions) },
    { label: "Average Basket", value: formatCurrency(store.avgBasket) },
    { label: "Stock Availability", value: `${store.stockAvailability}%` },
    {
      label: "Staff Present",
      value: `${store.staffPresent} / ${store.staffTotal}`,
    },
  ];

  return (
    <div className="animate-fade-in">
      <Link
        href="/stores"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Stores
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {store.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {store.city}, {store.country}
          </p>
          <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
            Store ID: {store.id}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill
              tone={store.status === "operational" ? "success" : "warning"}
            >
              {store.status === "operational" ? "Operational" : "Maintenance"}
            </Pill>
            <span className="text-sm text-[var(--text-secondary)]">
              Manager: {store.manager}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              Inventory
            </Button>
          </Link>
          <Link href="/pos">
            <Button variant="outline" size="sm">
              POS
            </Button>
          </Link>
          <Link href="/workforce">
            <Button variant="outline" size="sm">
              Staff
            </Button>
          </Link>
          <Link href="/operations">
            <Button size="sm">Operations</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-xl font-semibold">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <SurfaceCard className="mt-6 p-5">
        <h2 className="text-sm font-semibold">Today&apos;s Operations</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {(
            [
              ["Opening", storeOperations.opening],
              ["During day", storeOperations.during],
              ["Closing", storeOperations.closing],
            ] as const
          ).map(([title, items]) => (
            <div key={title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {title}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start gap-2 text-sm"
                  >
                    {item.done ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                    ) : "warn" in item && item.warn ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                    ) : (
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-[var(--border-strong)]" />
                    )}
                    <span
                      className={
                        item.done
                          ? "text-[var(--text-secondary)]"
                          : "text-[var(--text-primary)]"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
