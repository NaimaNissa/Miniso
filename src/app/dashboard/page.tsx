import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Building2, Store, ArrowRight } from "lucide-react";

export default function DashboardHubPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Choose a view"
        title="Dashboards"
        description="Owner network control or branch floor command — same live records, different scope."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/owner" className="group">
          <SurfaceCard hover className="flex h-full flex-col p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform group-hover:scale-105">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              Owner Dashboard
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              HQ view for network sales, region performance, store rankings,
              approvals, and supply signals.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
              Open owner view
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </SurfaceCard>
        </Link>

        <Link href="/dashboard/branch" className="group">
          <SurfaceCard hover className="flex h-full flex-col p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--info-soft)] text-[var(--info)] transition-transform group-hover:scale-105">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              Branch operations
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              Every store at a glance — sales vs target, staff, stock flags,
              checklists, and a focus store drill-down.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--info)]">
              Open branch view
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </SurfaceCard>
        </Link>
      </div>

      <SurfaceCard className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
        <p className="text-sm text-[var(--text-secondary)]">
          Switch anytime with the Owner / Branch control on each dashboard.
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
      </SurfaceCard>
    </div>
  );
}
