"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { useAuth } from "@/components/auth-provider";
import {
  ArrowLeftRight,
  Ship,
  Truck,
  Warehouse,
  ArrowRight,
} from "lucide-react";

const hubs = [
  {
    href: "/shipments",
    title: "Shipments",
    desc: "Inbound from China / Japan · receive & discrepancies",
    icon: Ship,
    badge: "3 in transit",
    module: "shipments" as const,
  },
  {
    href: "/warehouse",
    title: "Warehouse",
    desc: "Receiving, put-away, pick, pack, dispatch",
    icon: Warehouse,
    badge: null,
    module: "warehouse" as const,
  },
  {
    href: "/transfers",
    title: "Transfers",
    desc: "DC ↔ store moves and stock adjustments",
    icon: ArrowLeftRight,
    badge: null,
    module: "transfers" as const,
  },
  {
    href: "/procurement",
    title: "Procurement",
    desc: "Purchase orders, suppliers, arrivals",
    icon: Truck,
    badge: "5 pending",
    module: "procurement" as const,
  },
];

export default function SupplyHubPage() {
  const { canAccess } = useAuth();
  const visible = hubs.filter((h) => canAccess(h.module));

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title="Supply"
        description="Shipments, warehouse, transfers and procurement in one place"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((h) => {
          const Icon = h.icon;
          return (
            <Link key={h.href} href={h.href}>
              <SurfaceCard hover className="flex h-full items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{h.title}</p>
                    {h.badge && <Pill tone="neutral">{h.badge}</Pill>}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {h.desc}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              </SurfaceCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
