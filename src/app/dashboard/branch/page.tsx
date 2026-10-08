"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RoleSwitcher } from "@/components/dashboard/role-switcher";
import {
  DashboardFrame,
  DashboardSection,
  ProgressRail,
} from "@/components/dashboard/dashboard-frame";
import { KPICard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useRetail } from "@/components/retail-provider";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  Banknote,
  Check,
  ClipboardList,
  MessageSquare,
  ShoppingCart,
  Store,
  UsersRound,
} from "lucide-react";

export default function BranchDashboardPage() {
  const { user } = useAuth();
  const { ready, stores, branchBoards, branchId, storeOperations } = useRetail();

  const boards = useMemo(() => {
    const list = Object.values(branchBoards);
    if (list.length > 0) {
      return list.sort((a, b) => b.salesToday - a.salesToday);
    }
    return stores.map((store) => ({
      storeId: store.id,
      storeName: store.name,
      manager: store.manager,
      salesTarget: store.salesTarget || 1,
      salesToday: store.salesToday,
      transactions: store.transactions,
      avgBasket: store.avgBasket,
      stockAvailability: store.stockAvailability,
      lowStockSkus: 0,
      outOfStockSkus: 0,
      staffPresent: store.staffPresent,
      staffTotal: store.staffTotal,
      pendingTasks: 0,
      lastSaleAt: "",
      alerts: [] as {
        id: string;
        severity: "critical" | "warning" | "info";
        title: string;
        detail: string;
      }[],
      topSellers: [] as {
        name: string;
        units: number;
        revenue: number;
        oos?: boolean;
      }[],
      hourly: [] as number[],
    }));
  }, [branchBoards, stores]);

  const preferredId = user?.branchId || branchId || boards[0]?.storeId || "";
  const [selectedId, setSelectedId] = useState("");
  const activeId = selectedId || preferredId;
  const selected =
    boards.find((board) => board.storeId === activeId) ?? boards[0] ?? null;

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

  const summary = boards.reduce(
    (acc, board) => {
      acc.sales += board.salesToday;
      acc.target += board.salesTarget || 0;
      acc.transactions += board.transactions;
      acc.staffPresent += board.staffPresent;
      acc.staffTotal += board.staffTotal;
      acc.pendingTasks += board.pendingTasks;
      acc.lowStock += board.lowStockSkus;
      acc.outOfStock += board.outOfStockSkus;
      acc.alerts += board.alerts.length;
      acc.critical += board.alerts.filter((a) => a.severity === "critical").length;
      if (board.stockAvailability > 0) {
        acc.availSum += board.stockAvailability;
        acc.availCount += 1;
      }
      return acc;
    },
    {
      sales: 0,
      target: 0,
      transactions: 0,
      staffPresent: 0,
      staffTotal: 0,
      pendingTasks: 0,
      lowStock: 0,
      outOfStock: 0,
      alerts: 0,
      critical: 0,
      availSum: 0,
      availCount: 0,
    }
  );

  const networkProgress =
    summary.target > 0
      ? Math.min(100, Math.round((summary.sales / summary.target) * 100))
      : 0;
  const avgAvailability =
    summary.availCount > 0
      ? Math.round(summary.availSum / summary.availCount)
      : 0;
  const avgBasket =
    summary.transactions > 0
      ? Math.round(summary.sales / summary.transactions)
      : 0;

  const openTasks = [
    ...storeOperations.during,
    ...storeOperations.closing,
  ].filter((item) => !item.done);

  const openingDone = storeOperations.opening.filter((i) => i.done).length;
  const duringDone = storeOperations.during.filter((i) => i.done).length;
  const closingDone = storeOperations.closing.filter((i) => i.done).length;
  const opsTotal =
    storeOperations.opening.length +
    storeOperations.during.length +
    storeOperations.closing.length;
  const opsDone = openingDone + duringDone + closingDone;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="All store operations"
        title="Branch network"
        description={`${boards.length} stores · ${networkProgress}% of network target · ${summary.critical} critical alerts`}
        actions={
          <>
            <RoleSwitcher className="order-first w-full sm:order-none sm:w-auto" />
            <Link href="/operations" className="hidden md:inline-flex">
              <Button variant="outline" size="sm">
                <ClipboardList className="h-3.5 w-3.5" />
                Checklist
              </Button>
            </Link>
            <Link href="/workforce" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm">
                <UsersRound className="h-3.5 w-3.5" />
                Team
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

      <ProgressRail
        label="All branches · sales vs target"
        valueLabel={`${formatCurrency(summary.sales)} / ${formatCurrency(summary.target)}`}
        percent={networkProgress}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          compact
          label="Network sales"
          value={summary.sales}
          format="currency"
          icon={Banknote}
        />
        <KPICard
          compact
          label="Transactions"
          value={summary.transactions}
          suffix={`· avg ${formatCurrency(avgBasket)}`}
        />
        <KPICard
          compact
          label="Staff on floor"
          value={summary.staffPresent}
          suffix={`/ ${summary.staffTotal}`}
          icon={UsersRound}
        />
        <KPICard
          compact
          label="Stock available"
          value={avgAvailability}
          format="percent"
          suffix={`· ${summary.pendingTasks} tasks`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill tone="warning">{summary.lowStock} low stock</Pill>
        <Pill tone="danger">{summary.outOfStock} out of stock</Pill>
        <Pill tone="accent">{summary.pendingTasks} open tasks</Pill>
        <Pill tone={summary.critical > 0 ? "danger" : "info"}>
          {summary.alerts} alerts
        </Pill>
        <Pill tone="success">
          {opsDone}/{opsTotal || 0} checklist
        </Pill>
      </div>

      <DashboardSection
        title="Every branch"
        description="Tap a store for alerts, checklist, and sellers"
        action={
          <span className="text-xs text-[var(--text-muted)]">
            {boards.length} stores
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {boards.map((board) => {
            const progress = Math.min(
              100,
              Math.round(
                (board.salesToday / Math.max(1, board.salesTarget)) * 100
              )
            );
            const active =
              activeId === board.storeId || selected?.storeId === board.storeId;
            const critical = board.alerts.filter(
              (a) => a.severity === "critical"
            ).length;
            return (
              <button
                key={board.storeId}
                type="button"
                onClick={() => setSelectedId(board.storeId)}
                className="text-left"
              >
                <SurfaceCard
                  hover
                  className={cn(
                    "h-full p-4 transition-all",
                    active &&
                      "ring-1 ring-[var(--accent)] shadow-[var(--shadow-md)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                        <p className="truncate text-sm font-semibold">
                          {board.storeName}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                        {board.manager || "—"}
                      </p>
                    </div>
                    {critical > 0 ? (
                      <Pill tone="danger">{critical}</Pill>
                    ) : board.pendingTasks > 0 ? (
                      <Pill tone="warning">{board.pendingTasks}</Pill>
                    ) : (
                      <Pill tone="success">OK</Pill>
                    )}
                  </div>

                  <p className="mt-4 text-lg font-semibold tracking-tight tabular-nums">
                    {formatCurrency(board.salesToday)}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                    {progress}% of {formatCurrency(board.salesTarget)}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-y-1 text-[11px] text-[var(--text-secondary)]">
                    <span>
                      Staff {board.staffPresent}/{board.staffTotal}
                    </span>
                    <span className="text-right">
                      Stock {board.stockAvailability}%
                    </span>
                    <span>{board.transactions} txns</span>
                    <span className="text-right">
                      {board.lowStockSkus + board.outOfStockSkus} flags
                    </span>
                  </div>
                </SurfaceCard>
              </button>
            );
          })}
        </div>
      </DashboardSection>

      {selected && (
        <div className="space-y-4 border-t border-[var(--border)] pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                Focus store
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {selected.storeName}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Manager {selected.manager || "—"} · last sale{" "}
                {selected.lastSaleAt || "—"} ·{" "}
                {Math.min(
                  100,
                  Math.round(
                    (selected.salesToday / Math.max(1, selected.salesTarget)) *
                      100
                  )
                )}
                % of target
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/social">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Social
                </Button>
              </Link>
              <Link href={`/stores/${selected.storeId}`}>
                <Button variant="outline" size="sm">
                  Store
                </Button>
              </Link>
              <Link href="/operations">
                <Button size="sm">Operations</Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill tone="warning">{selected.lowStockSkus} low stock</Pill>
            <Pill tone="danger">{selected.outOfStockSkus} out of stock</Pill>
            <Pill tone="accent">{selected.pendingTasks} tasks</Pill>
            <Pill tone="info">
              {selected.staffPresent}/{selected.staffTotal} staff
            </Pill>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <SurfaceCard className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <h3 className="text-sm font-semibold">Act now</h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {selected.alerts.length} alerts
                </span>
              </div>
              {selected.alerts.length === 0 ? (
                <p className="flex items-center gap-2 px-4 py-8 text-sm text-[var(--success)]">
                  <Check className="h-4 w-4" /> No open alerts for this store
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {selected.alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--background-elevated)]/60"
                    >
                      <AlertTriangle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          alert.severity === "critical"
                            ? "text-[var(--danger)]"
                            : alert.severity === "warning"
                              ? "text-[var(--warning)]"
                              : "text-[var(--info)]"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                          {alert.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SurfaceCard>

            <div className="space-y-4">
              <SurfaceCard className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Shift checklist</h3>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {openTasks.length} left
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  {[
                    ["Opening", openingDone, storeOperations.opening.length],
                    ["During", duringDone, storeOperations.during.length],
                    ["Closing", closingDone, storeOperations.closing.length],
                  ].map(([label, done, total]) => (
                    <div
                      key={String(label)}
                      className="rounded-[var(--radius-md)] bg-[var(--background-elevated)] px-2 py-2.5"
                    >
                      <p className="font-semibold tabular-nums">
                        {done}/{total}
                      </p>
                      <p className="text-[var(--text-muted)]">{label}</p>
                    </div>
                  ))}
                </div>
                {openTasks.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-[var(--success)]">
                    <Check className="h-4 w-4" /> All clear for now
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {openTasks.slice(0, 5).map((item) => (
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
              </SurfaceCard>

              <SurfaceCard className="p-4">
                <h3 className="mb-3 text-sm font-semibold">Top sellers</h3>
                {selected.topSellers.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    No seller data yet today.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {selected.topSellers.slice(0, 4).map((product) => (
                      <li
                        key={product.name}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="truncate font-medium">
                          {product.name}
                        </span>
                        {product.oos ? (
                          <Pill tone="danger">OOS</Pill>
                        ) : (
                          <span className="shrink-0 tabular-nums text-[var(--text-secondary)]">
                            {product.units} · {formatCurrency(product.revenue)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </SurfaceCard>
            </div>
          </div>
        </div>
      )}
    </DashboardFrame>
  );
}
