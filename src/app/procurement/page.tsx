"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useRetail } from "@/components/retail-provider";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const poTimeline = [
  "Created",
  "Reviewed",
  "Approved",
  "Supplier Confirmed",
  "In Production",
  "Shipped",
  "Received",
];

const statusMap = {
  in_transit: { label: "In Transit", tone: "info" as const },
  pending_approval: { label: "Pending Approval", tone: "warning" as const },
  received: { label: "Received", tone: "success" as const },
  supplier_confirmed: { label: "Supplier Confirmed", tone: "accent" as const },
  declined: { label: "Declined", tone: "danger" as const },
};

export default function ProcurementPage() {
  const { purchaseOrders, warehouses, ready, reload, token } = useRetail();
  const { user } = useAuth();
  const [selected, setSelected] = useState<(typeof purchaseOrders)[0] | null>(
    null
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [destination, setDestination] = useState("Dhaka DC");
  const [warehouseId, setWarehouseId] = useState("WH-BD-DHK-01");
  const [expected, setExpected] = useState("");
  const [items, setItems] = useState("12");
  const [value, setValue] = useState("450000");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const canCreate =
    user?.role === "owner" || user?.role === "inventory_manager";

  const counts = useMemo(() => {
    const pending = purchaseOrders.filter((p) => p.status === "pending_approval").length;
    const transit = purchaseOrders.filter((p) => p.status === "in_transit").length;
    const confirmed = purchaseOrders.filter(
      (p) => p.status === "supplier_confirmed"
    ).length;
    return {
      total: purchaseOrders.length,
      pending,
      transit,
      confirmed,
      expected: purchaseOrders.filter((p) =>
        ["pending_approval", "supplier_confirmed", "in_transit"].includes(p.status)
      ).length,
    };
  }, [purchaseOrders]);

  async function submitPO() {
    if (!token || !canCreate) return;
    setBusy(true);
    setFormError("");
    try {
      await api.createApproval(token, {
        type: "purchase",
        supplier: supplier.trim(),
        destination: destination.trim() || "Dhaka DC",
        warehouseId,
        expected: expected.trim(),
        items: Number(items) || 1,
        value: Number(value) || 0,
        reason: reason.trim() || `Replenishment PO for ${supplier.trim()}`,
      });
      setCreateOpen(false);
      setSupplier("");
      setReason("");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create PO");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Procurement"
        description="Purchase orders open an approval before supplier confirmation"
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              Create PO
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Purchase Orders", value: String(counts.total) },
          { label: "Pending Approval", value: String(counts.pending) },
          { label: "In Transit", value: String(counts.transit) },
          { label: "Supplier Confirmed", value: String(counts.confirmed) },
          { label: "Open pipeline", value: String(counts.expected) },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <SurfaceCard className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">PO</th>
                <th className="px-3 py-3 font-medium">Supplier</th>
                <th className="px-3 py-3 font-medium">Destination</th>
                <th className="px-3 py-3 font-medium">Expected</th>
                <th className="px-3 py-3 font-medium">Items</th>
                <th className="px-3 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => {
                const status =
                  statusMap[po.status as keyof typeof statusMap] ?? {
                    label: po.status,
                    tone: "neutral" as const,
                  };
                return (
                  <tr
                    key={po.id}
                    onClick={() => setSelected(po)}
                    className="cursor-pointer border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
                  >
                    <td className="px-5 py-3.5 font-medium">{po.id}</td>
                    <td className="px-3 py-3.5">{po.supplier}</td>
                    <td className="px-3 py-3.5 text-[var(--text-secondary)]">
                      {po.destination}
                    </td>
                    <td className="px-3 py-3.5">{po.expected}</td>
                    <td className="px-3 py-3.5">{po.items}</td>
                    <td className="px-3 py-3.5 font-medium">
                      {formatCurrency(po.value)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.id ?? "Purchase Order"}
        width="lg"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
            {selected?.status === "pending_approval" && (
              <Button
                className="flex-1"
                onClick={() => {
                  setSelected(null);
                  window.location.href = "/approvals";
                }}
              >
                Open approvals
              </Button>
            )}
          </div>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Supplier</p>
                <p className="font-medium">{selected.supplier}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Destination</p>
                <p className="font-medium">{selected.destination}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Expected Arrival
                </p>
                <p className="font-medium">{selected.expected}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Value</p>
                <p className="font-medium">
                  {formatCurrency(selected.value)}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Approval timeline
              </p>
              <ol className="space-y-0">
                {poTimeline.map((step, i) => {
                  const done = i <= selected.stage;
                  const current = i === selected.stage;
                  return (
                    <li key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                            done
                              ? "bg-[var(--accent)] text-white"
                              : "border border-[var(--border)] text-[var(--text-muted)]"
                          )}
                        >
                          {i + 1}
                        </span>
                        {i < poTimeline.length - 1 && (
                          <span
                            className={cn(
                              "my-1 w-px flex-1 min-h-[16px]",
                              done ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                            )}
                          />
                        )}
                      </div>
                      <p
                        className={cn(
                          "pb-4 text-sm",
                          current
                            ? "font-semibold text-[var(--accent)]"
                            : done
                              ? "text-[var(--text-primary)]"
                              : "text-[var(--text-muted)]"
                        )}
                      >
                        {step}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </SideDrawer>

      <SideDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create purchase order"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" disabled={busy} onClick={() => void submitPO()}>
              Submit for approval
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          {formError && <p className="text-[var(--danger)]">{formError}</p>}
          <p className="text-[var(--text-secondary)]">
            Creates a PO in pending approval. Approving it moves the order to
            supplier confirmed.
          </p>
          <label className="block text-xs text-[var(--text-muted)]">
            Supplier
            <input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              placeholder="Guangzhou Toys Co."
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Destination
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Warehouse
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Expected arrival
            <input
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              placeholder="22 Oct 2026"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-[var(--text-muted)]">
              Line items
              <input
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Value (BDT)
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs text-[var(--text-muted)]">
            Reason for reviewers
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 py-2 text-sm"
              placeholder="Rush replenishment for Sanrio IP launch"
            />
          </label>
        </div>
      </SideDrawer>
    </div>
  );
}
