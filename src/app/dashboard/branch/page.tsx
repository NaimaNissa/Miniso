"use client";

import Link from "next/link";
import { RoleSwitcher } from "@/components/dashboard/role-switcher";
import { KPICard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  branchToday,
  branchHourlySales,
  branchAlerts,
  branchTopSellers,
  storeOperations,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  Banknote,
  Check,
  MessageSquare,
  ShoppingCart,
  UsersRound,
} from "lucide-react";

export default function BranchDashboardPage() {
  const progress = Math.min(
    100,
    Math.round((branchToday.salesToday / branchToday.salesTarget) * 100)
  );

  const openTasks = [
    ...storeOperations.during,
    ...storeOperations.closing,
  ].filter((i) => !i.done);

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title={branchToday.storeName}
        description={`Target ${progress}% · ${branchToday.staffPresent}/${branchToday.staffTotal} staff · last sale ${branchToday.lastSaleAt}`}
        actions={
          <>
            <RoleSwitcher />
            <Link href="/social">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-3.5 w-3.5" />
                Social
                <span className="rounded-full bg-[var(--accent)] px-1.5 text-[10px] text-white">
                  2
                </span>
              </Button>
            </Link>
            <Link href="/pos">
              <Button size="sm">
                <ShoppingCart className="h-3.5 w-3.5" />
                POS
              </Button>
            </Link>
          </>
        }
      />

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Sales vs target</span>
          <span className="font-medium text-[var(--text-secondary)]">
            {formatCurrency(branchToday.salesToday)} /{" "}
            {formatCurrency(branchToday.salesTarget)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          compact
          label="Sales today"
          value={branchToday.salesToday}
          format="currency"
          change={12.1}
          icon={Banknote}
          sparkline={branchHourlySales}
        />
        <KPICard
          compact
          label="Transactions"
          value={branchToday.transactions}
          change={8.4}
        />
        <KPICard
          compact
          label="Avg basket"
          value={branchToday.avgBasket}
          format="currency"
          change={3.2}
        />
        <KPICard
          compact
          label="Stock / staff"
          value={branchToday.stockAvailability}
          format="percent"
          suffix={`· ${branchToday.staffPresent}/${branchToday.staffTotal}`}
          icon={UsersRound}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href="/inventory">
          <Pill tone="warning">{branchToday.lowStockSkus} low stock</Pill>
        </Link>
        <Link href="/inventory">
          <Pill tone="danger">{branchToday.outOfStockSkus} out of stock</Pill>
        </Link>
        <Link href="/operations">
          <Pill tone="accent">{branchToday.pendingTasks} tasks</Pill>
        </Link>
        <Link href="/social">
          <Pill tone="info">2 social chats</Pill>
        </Link>
      </div>

      <SurfaceCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--info-soft)] text-[var(--info)]">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Branch social agent</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Instagram / WhatsApp questions for {branchToday.storeName} — live
              stock, price, ETA. AI replies; staff can take over.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/lookup">
            <Button variant="outline" size="sm">
              Product lookup
            </Button>
          </Link>
          <Link href="/social">
            <Button size="sm">Open inbox</Button>
          </Link>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <SurfaceCard className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold">Act now</h2>
            <Link href="/operations">
              <Button variant="ghost" size="sm">
                Operations
              </Button>
            </Link>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {branchAlerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--background-elevated)]"
              >
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 ${
                    alert.severity === "critical"
                      ? "text-[var(--danger)]"
                      : alert.severity === "warning"
                        ? "text-[var(--warning)]"
                        : "text-[var(--info)]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{alert.title}</p>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    {alert.detail}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Act
                </Button>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Open checklist</h2>
              <span className="text-[11px] text-[var(--text-muted)]">
                {openTasks.length} left
              </span>
            </div>
            {openTasks.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-[var(--success)]">
                <Check className="h-4 w-4" /> All clear for now
              </p>
            ) : (
              <ul className="space-y-2">
                {openTasks.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    {"warn" in item && item.warn ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--border-strong)]" />
                    )}
                    <span className="flex-1">{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/operations" className="mt-3 block">
              <Button variant="secondary" size="sm" className="w-full">
                Open operations
              </Button>
            </Link>
          </SurfaceCard>

          <SurfaceCard className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Top sellers</h2>
            <ul className="space-y-2">
              {branchTopSellers.slice(0, 3).map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate font-medium">{p.name}</span>
                  {p.oos ? (
                    <Pill tone="danger">OOS</Pill>
                  ) : (
                    <span className="shrink-0 text-[var(--text-secondary)]">
                      {p.units} · {formatCurrency(p.revenue)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
