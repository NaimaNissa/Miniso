import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard, GlassCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

const promos = [
  {
    name: "Sanrio Weekend Points Boost",
    status: "Active",
    period: "4–12 Oct 2026",
    scope: "Toys & IP · Bangladesh",
  },
  {
    name: "Stationery Clearance −15%",
    status: "Pending approval",
    period: "10–17 Oct 2026",
    scope: "Gel pens & notebooks",
  },
  {
    name: "Member Double Points Friday",
    status: "Scheduled",
    period: "Every Friday",
    scope: "All stores · Gold+",
  },
];

export default function PromotionsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Promotions"
        description="Campaigns, offers and loyalty multipliers"
        actions={<Button size="sm">Create promotion</Button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active campaigns", value: "6" },
          { label: "Pending approval", value: "3" },
          { label: "Avg margin impact", value: "−2.1 pts" },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-3">
        {promos.map((p) => (
          <SurfaceCard key={p.name} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{p.name}</h2>
                <Pill
                  tone={
                    p.status === "Active"
                      ? "success"
                      : p.status === "Pending approval"
                        ? "warning"
                        : "info"
                  }
                >
                  {p.status}
                </Pill>
              </div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {p.period} · {p.scope}
              </p>
            </div>
            <Button variant="outline" size="sm">
              View
            </Button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
