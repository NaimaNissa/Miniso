"use client";

import Link from "next/link";
import { RoleSwitcher } from "@/components/dashboard/role-switcher";
import {
  DashboardFrame,
  DashboardSection,
  MetaStrip,
} from "@/components/dashboard/dashboard-frame";
import { KPICard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useRetail } from "@/components/retail-provider";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  Banknote,
  Boxes,
  Percent,
  TrendingUp,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const {
    ready,
    ownerMetrics,
    regionPerformance,
    topStoresBySales,
    approvals,
    salesSparkline,
    org,
  } = useRetail();
  if (!ready) {
    return (
      <div className="space-y-4">
        <div className="h-16 skeleton rounded-[var(--radius-lg)]" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow={org?.hq.name ?? "Bangladesh HQ"}
        title="Owner Dashboard"
        description={`${ownerMetrics.openStores}/${ownerMetrics.totalStores} stores open · ${ownerMetrics.criticalExceptions} critical · ${ownerMetrics.pendingApprovals} approvals waiting`}
        actions={
          <>
            <RoleSwitcher className="order-first w-full sm:order-none sm:w-auto" />
            <Link href="/workforce" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm">
                Invite people
              </Button>
            </Link>
            <Link href="/approvals">
              <Button size="sm">Review approvals</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          compact
          label="Sales today"
          value={ownerMetrics.networkSalesToday}
          format="currency"
          change={ownerMetrics.networkSalesChange}
          icon={Banknote}
          sparkline={salesSparkline}
        />
        <KPICard
          compact
          label="Month to date"
          value={ownerMetrics.monthToDate}
          format="currency"
          change={ownerMetrics.monthToDateChange}
          changeLabel="vs LM"
          icon={TrendingUp}
        />
        <KPICard
          compact
          label="Gross margin"
          value={ownerMetrics.grossMargin}
          format="percent"
          change={ownerMetrics.grossMarginChange}
          changeLabel="pts"
          icon={Percent}
        />
        <KPICard
          compact
          label="Inventory value"
          value={ownerMetrics.inventoryValue}
          format="currency"
          change={8.4}
          changeLabel="vs LM"
          icon={Boxes}
        />
      </div>

      <MetaStrip
        items={[
          { label: "Turns", value: `${ownerMetrics.inventoryTurns}×` },
          { label: "OTIF", value: `${ownerMetrics.supplierOtif}%` },
          { label: "Forecast", value: `${ownerMetrics.forecastAccuracy}%` },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <DashboardSection
          title="Regions"
          description="Sales and availability by city"
          action={
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]"
            >
              Reports <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <SurfaceCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Region</th>
                    <th className="px-3 py-3 font-medium">Sales</th>
                    <th className="px-3 py-3 font-medium">Growth</th>
                    <th className="px-3 py-3 font-medium">Avail.</th>
                    <th className="px-4 py-3 font-medium">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {regionPerformance.map((r) => (
                    <tr
                      key={r.region}
                      className="border-t border-[var(--border)] transition-colors hover:bg-[var(--background-elevated)]/70"
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.region}
                        <span className="ml-1.5 text-[11px] font-normal text-[var(--text-muted)]">
                          {r.stores} stores
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold tabular-nums">
                        {formatCurrency(r.sales)}
                      </td>
                      <td
                        className={`px-3 py-3 tabular-nums ${
                          r.growth >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]"
                        }`}
                      >
                        {r.growth >= 0 ? "+" : ""}
                        {r.growth}%
                      </td>
                      <td className="px-3 py-3 tabular-nums text-[var(--text-secondary)]">
                        {r.availability}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            r.alerts > 5
                              ? "font-semibold text-[var(--danger)]"
                              : "text-[var(--warning)]"
                          }
                        >
                          {r.alerts}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        </DashboardSection>

        <div className="space-y-4">
          <DashboardSection
            title="Needs action"
            action={
              <Link href="/approvals">
                <Button variant="ghost" size="sm">
                  All
                </Button>
              </Link>
            }
          >
            <SurfaceCard className="p-4">
              <ul className="space-y-3">
                {approvals.slice(0, 3).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        {a.requestedBy}
                        {a.financialImpact
                          ? ` · ${formatCurrency(Math.abs(a.financialImpact))}`
                          : ""}
                      </p>
                    </div>
                    <Pill
                      tone={
                        a.risk === "high"
                          ? "danger"
                          : a.risk === "medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {a.risk}
                    </Pill>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </DashboardSection>

          <DashboardSection
            title="Top stores"
            action={
              <Link href="/stores">
                <Button variant="ghost" size="sm">
                  All
                </Button>
              </Link>
            }
          >
            <SurfaceCard className="p-4">
              <ul className="space-y-2.5">
                {topStoresBySales.slice(0, 4).map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--background-elevated)] text-[10px] font-semibold text-[var(--text-muted)]">
                        {s.rank}
                      </span>
                      <span className="truncate font-medium">{s.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {formatCurrency(s.sales)}
                    </span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </DashboardSection>
        </div>
      </div>
    </DashboardFrame>
  );
}
