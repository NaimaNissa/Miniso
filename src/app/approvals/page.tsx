"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useRetail } from "@/components/retail-provider";
import { useAuth } from "@/components/auth-provider";
import { api, type ApprovalRecord } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const emptyStats = {
  inventory: 0,
  purchase: 0,
  price: 0,
  refund: 0,
  supplier: 0,
  total: 0,
};

const typeMeta: { key: keyof Omit<typeof emptyStats, "total">; label: string }[] = [
  { key: "inventory", label: "Inventory" },
  { key: "purchase", label: "Purchase orders" },
  { key: "price", label: "Price / promo" },
  { key: "refund", label: "Refunds" },
  { key: "supplier", label: "Suppliers" },
];

const typeLabel: Record<string, string> = {
  inventory: "Inventory",
  purchase: "Purchase",
  price: "Price",
  refund: "Refund",
  supplier: "Supplier",
};

export default function ApprovalsPage() {
  const { approvals, approvalHistory, approvalStats, ready, reload, token } =
    useRetail();
  const { user } = useAuth();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [requestOpen, setRequestOpen] = useState<"refund" | "supplier" | null>(
    null
  );
  const [sku, setSku] = useState("SKU-6611");
  const [qty, setQty] = useState("1");
  const [supplier, setSupplier] = useState("");
  const [reason, setReason] = useState("");
  const canDecide =
    user?.role === "owner" || user?.role === "inventory_manager";
  const canRefund = user?.role === "store_manager" || user?.role === "owner";
  const canSupplier =
    user?.role === "owner" || user?.role === "inventory_manager";

  const stats = approvalStats ?? emptyStats;
  const pending = useMemo(() => {
    if (filter === "all") return approvals;
    return approvals.filter((a) => a.type === filter);
  }, [approvals, filter]);

  async function decide(id: string, status: "approved" | "declined") {
    if (!token || !canDecide) return;
    setBusy(id);
    setError("");
    try {
      await api.decideApproval(token, id, status);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision failed");
    } finally {
      setBusy("");
    }
  }

  async function submitRequest() {
    if (!token || !requestOpen) return;
    setBusy("request");
    setError("");
    try {
      if (requestOpen === "refund") {
        await api.createApproval(token, {
          type: "refund",
          sku: sku.trim(),
          qty: Number(qty) || 1,
          reason: reason.trim() || `Customer return for ${sku.trim()}`,
        });
      } else {
        await api.createApproval(token, {
          type: "supplier",
          supplier: supplier.trim(),
          reason:
            reason.trim() || `Onboard ${supplier.trim()} as a vendor partner`,
        });
      }
      setRequestOpen(null);
      setReason("");
      setSupplier("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setBusy("");
    }
  }

  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Approvals"
        description={
          canDecide
            ? "Decide high-impact requests — approve applies stock, PO, promo, or refund side effects"
            : "Track requests your team submitted. Owners and inventory managers decide them."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {canRefund && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRequestOpen("refund")}
              >
                Request refund
              </Button>
            )}
            {canSupplier && (
              <Button size="sm" onClick={() => setRequestOpen("supplier")}>
                Onboard supplier
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {typeMeta.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(filter === t.key ? "all" : t.key)}
            className="text-left"
          >
            <GlassCard
              className={cn(
                "p-4 transition-colors",
                filter === t.key && "ring-1 ring-[var(--accent)]"
              )}
            >
              <p className="text-xs text-[var(--text-muted)]">{t.label}</p>
              <p className="mt-1 text-2xl font-semibold">{stats[t.key]}</p>
            </GlassCard>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Pending · {pending.length}
            {filter !== "all" ? ` · ${typeLabel[filter] ?? filter}` : ""}
          </h2>
          {filter !== "all" && (
            <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
              Clear filter
            </Button>
          )}
        </div>

        {pending.length === 0 ? (
          <SurfaceCard className="py-16 text-center">
            <p className="font-semibold">No pending approvals</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Raise a stock adjustment, purchase order, promo, or refund to open
              a request.
            </p>
          </SurfaceCard>
        ) : (
          pending.map((a) => (
            <ApprovalCard
              key={a.id}
              approval={a}
              canDecide={canDecide}
              busy={busy === a.id}
              onDecide={decide}
            />
          ))
        )}
      </div>

      {approvalHistory.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Recent decisions
          </h2>
          {approvalHistory.slice(0, 12).map((a) => (
            <SurfaceCard
              key={a.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{a.title}</p>
                  <Pill tone={a.status === "approved" ? "success" : "danger"}>
                    {a.status ?? "decided"}
                  </Pill>
                  <Pill tone="neutral">{typeLabel[a.type] ?? a.type}</Pill>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {a.id}
                  {a.decidedBy ? ` · ${a.decidedBy}` : ""}
                  {a.decidedAt ? ` · ${a.decidedAt}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-xs text-[var(--text-secondary)]">
                {a.inventoryImpact}
              </p>
            </SurfaceCard>
          ))}
        </div>
      )}

      <SideDrawer
        open={!!requestOpen}
        onClose={() => setRequestOpen(null)}
        title={
          requestOpen === "supplier" ? "Onboard supplier" : "Request refund"
        }
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRequestOpen(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={busy === "request"}
              onClick={() => void submitRequest()}
            >
              Submit for approval
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          {requestOpen === "refund" ? (
            <>
              <p className="text-[var(--text-secondary)]">
                Restocks the branch only after HQ approves the return.
              </p>
              <label className="block text-xs text-[var(--text-muted)]">
                SKU
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                />
              </label>
              <label className="block text-xs text-[var(--text-muted)]">
                Quantity
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                />
              </label>
            </>
          ) : (
            <label className="block text-xs text-[var(--text-muted)]">
              Supplier name
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                placeholder="EcoPack BD"
              />
            </label>
          )}
          <label className="block text-xs text-[var(--text-muted)]">
            Reason for reviewers
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 py-2 text-sm"
            />
          </label>
        </div>
      </SideDrawer>
    </div>
  );
}

function ApprovalCard({
  approval: a,
  canDecide,
  busy,
  onDecide,
}: {
  approval: ApprovalRecord;
  canDecide: boolean;
  busy: boolean;
  onDecide: (id: string, status: "approved" | "declined") => void;
}) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-[var(--text-primary)]">
              {a.title}
            </h2>
            <Pill tone="neutral">{typeLabel[a.type] ?? a.type}</Pill>
            <Pill
              tone={
                a.risk === "high"
                  ? "danger"
                  : a.risk === "medium"
                    ? "warning"
                    : "neutral"
              }
            >
              {a.risk} risk
            </Pill>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {a.id} · Requested by {a.requestedBy} · {a.date}
            {a.poId ? ` · ${a.poId}` : ""}
            {a.adjustmentId ? ` · ${a.adjustmentId}` : ""}
            {a.promotionId ? ` · ${a.promotionId}` : ""}
          </p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{a.reason}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <span>
              <span className="text-[var(--text-muted)]">Financial impact: </span>
              <span className="font-medium">
                {a.financialImpact === 0
                  ? "—"
                  : formatCurrency(Math.abs(a.financialImpact))}
              </span>
            </span>
            <span>
              <span className="text-[var(--text-muted)]">Inventory: </span>
              <span className="font-medium">{a.inventoryImpact}</span>
            </span>
          </div>
        </div>
        {canDecide ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => onDecide(a.id, "declined")}
            >
              Reject
            </Button>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => onDecide(a.id, "approved")}
            >
              Approve
            </Button>
          </div>
        ) : (
          <Pill tone="warning">Awaiting HQ decision</Pill>
        )}
      </div>
    </SurfaceCard>
  );
}
