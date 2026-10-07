"use client";

import Link from "next/link";
import { RoleSwitcher } from "@/components/dashboard/role-switcher";
import { KPICard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  ownerMetrics,
  regionPerformance,
  topStoresBySales,
  approvals,
  salesSparkline,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  Banknote,
  Boxes,
  Percent,
  TrendingUp,
} from "lucide-react";

export default function OwnerDashboardPage() {
  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title="Owner Dashboard"
        description={`${ownerMetrics.openStores}/${ownerMetrics.totalStores} stores open · ${ownerMetrics.criticalExceptions} critical · ${ownerMetrics.pendingApprovals} approvals`}
        actions={
          <>
            <RoleSwitcher />
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

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)]">
        <span>
          Turns{" "}
          <strong className="text-[var(--text-primary)]">
            {ownerMetrics.inventoryTurns}×
          </strong>
        </span>
        <span>
          OTIF{" "}
          <strong className="text-[var(--text-primary)]">
            {ownerMetrics.supplierOtif}%
          </strong>
        </span>
        <span>
          Forecast{" "}
          <strong className="text-[var(--text-primary)]">
            {ownerMetrics.forecastAccuracy}%
          </strong>
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SurfaceCard className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold">Regions</h2>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]"
            >
              Reports <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-y border-[var(--border)] text-[11px] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-2 font-medium">Region</th>
                <th className="px-2 py-2 font-medium">Sales</th>
                <th className="px-2 py-2 font-medium">Growth</th>
                <th className="px-2 py-2 font-medium">Avail.</th>
                <th className="px-4 py-2 font-medium">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {regionPerformance.map((r) => (
                <tr
                  key={r.region}
                  className="border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
                >
                  <td className="px-4 py-2.5 font-medium">
                    {r.region}
                    <span className="ml-1.5 text-[11px] font-normal text-[var(--text-muted)]">
                      {r.stores}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 font-semibold">
                    {formatCurrency(r.sales)}
                  </td>
                  <td
                    className={`px-2 py-2.5 ${
                      r.growth >= 0
                        ? "text-[var(--success)]"
                        : "text-[var(--danger)]"
                    }`}
                  >
                    {r.growth >= 0 ? "+" : ""}
                    {r.growth}%
                  </td>
                  <td className="px-2 py-2.5 text-[var(--text-secondary)]">
                    {r.availability}%
                  </td>
                  <td className="px-4 py-2.5">
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
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Needs action</h2>
              <Link href="/approvals">
                <Button variant="ghost" size="sm">
                  All
                </Button>
              </Link>
            </div>
            <ul className="space-y-2">
              {approvals.slice(0, 3).map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
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

          <SurfaceCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Top stores</h2>
              <Link href="/stores">
                <Button variant="ghost" size="sm">
                  All
                </Button>
              </Link>
            </div>
            <ul className="space-y-2">
              {topStoresBySales.slice(0, 4).map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-4 text-[11px] font-semibold text-[var(--text-muted)]">
                      {s.rank}
                    </span>
                    <span className="truncate font-medium">{s.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold">
                    {formatCurrency(s.sales)}
                  </span>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
