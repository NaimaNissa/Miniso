"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { useAuth } from "@/components/auth-provider";
import { BarChart3, Sparkles, ArrowRight } from "lucide-react";

const hubs = [
  {
    href: "/reports",
    title: "Reports",
    desc: "Sales, inventory, OTIF and forecast KPIs",
    icon: BarChart3,
    module: "reports" as const,
  },
  {
    href: "/ai",
    title: "AI Insights",
    desc: "Stockout risk, replenishment, transfer recommendations",
    icon: Sparkles,
    module: "ai" as const,
  },
];

export default function InsightsHubPage() {
  const { canAccess } = useAuth();
  const visible = hubs.filter((h) => canAccess(h.module));

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title="Insights"
        description="Analytics and AI recommendations"
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
                  <p className="font-semibold">{h.title}</p>
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
