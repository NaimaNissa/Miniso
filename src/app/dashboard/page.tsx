import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Building2, Store, ArrowRight } from "lucide-react";

export default function DashboardHubPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboards"
        description="Choose your operating view — owner network control or branch floor command"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Link href="/dashboard/owner" className="group">
          <SurfaceCard hover className="h-full p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] transition-transform group-hover:scale-105">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Owner Dashboard</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              HQ management view for network sales, margin, region performance,
              multi-store rankings, approvals, and supply pipeline.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-[var(--text-muted)]">
              <li>· Country / region P&amp;L signals</li>
              <li>· Exception &amp; approval control tower</li>
              <li>· Top stores &amp; procurement status</li>
            </ul>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
              Open owner view
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </SurfaceCard>
        </Link>

        <Link href="/dashboard/branch" className="group">
          <SurfaceCard hover className="h-full p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--info-soft)] text-[var(--info)] transition-transform group-hover:scale-105">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Branch Dashboard</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Store manager command center for today&apos;s sales target, staff,
              local stock alerts, POS, and opening / closing checklist.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-[var(--text-muted)]">
              <li>· Sales vs daily target</li>
              <li>· Floor alerts &amp; task queue</li>
              <li>· Shift operations timeline</li>
            </ul>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--info)]">
              Open branch view
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </SurfaceCard>
        </Link>
      </div>

      <GlassCard className="mt-6 flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <p className="text-sm text-[var(--text-secondary)]">
          Tip: switch views anytime from the Owner / Branch toggle on each
          dashboard.
        </p>
        <div className="flex gap-2">
          <Link href="/dashboard/owner">
            <Button size="sm">Owner</Button>
          </Link>
          <Link href="/dashboard/branch">
            <Button variant="secondary" size="sm">
              Branch
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
