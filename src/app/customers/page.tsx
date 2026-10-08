"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useRetail } from "@/components/retail-provider";
import { formatCurrency } from "@/lib/utils";

const tierTone = {
  Gold: "warning" as const,
  Silver: "neutral" as const,
  Platinum: "info" as const,
};

export default function CustomersPage() {
  const { customers, ready } = useRetail();
  const [selected, setSelected] = useState<(typeof customers)[0] | null>(null);
  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description="Loyalty members, purchase history and service cases"
        actions={
          <>
            <Link href="/social">
              <Button variant="outline" size="sm">
                Social inbox
              </Button>
            </Link>
            <Link href="/promotions">
              <Button variant="outline" size="sm">
                Promotions
              </Button>
            </Link>
            <Button size="sm">Add customer</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {customers.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="text-left"
          >
            <SurfaceCard hover className="h-full p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{c.phone}</p>
                </div>
                <Pill tone={tierTone[c.tier as keyof typeof tierTone]}>
                  {c.tier}
                </Pill>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Lifetime spend
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(c.lifetimeSpend)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Points</p>
                  <p className="font-semibold">{c.points}</p>
                </div>
              </div>
            </SurfaceCard>
          </button>
        ))}
      </div>

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Customer profile"
        footer={
          <Button className="w-full" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">{selected.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {selected.phone}
              </p>
              <div className="mt-2">
                <Pill tone={tierTone[selected.tier as keyof typeof tierTone]}>
                  {selected.tier} member
                </Pill>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Lifetime Spend",
                  value: formatCurrency(selected.lifetimeSpend),
                },
                { label: "Orders", value: String(selected.orders) },
                {
                  label: "Average Basket",
                  value: formatCurrency(selected.avgBasket),
                },
                { label: "Points", value: String(selected.points) },
              ].map((m) => (
                <GlassCard key={m.label} className="p-3">
                  <p className="text-xs text-[var(--text-muted)]">{m.label}</p>
                  <p className="mt-1 font-semibold">{m.value}</p>
                </GlassCard>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Recent purchases
              </p>
              <ul className="space-y-2">
                {[
                  "Sanrio Plush Bear · ৳1,250 · Dhanmondi",
                  "Canvas Tote Bag · ৳850 · Gulshan",
                  "Gel Pen Set · ৳390 · Dhanmondi",
                ].map((p) => (
                  <li
                    key={p}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
