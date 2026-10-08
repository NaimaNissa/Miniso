"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useAuth } from "@/components/auth-provider";
import { useRetail } from "@/components/retail-provider";
import { api } from "@/lib/api";

export default function TransfersPage() {
  const { user, token } = useAuth();
  const { transfers, adjustments, stores, ready, reload } = useRetail();
  const [tab, setTab] = useState("transfer");
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("SKU-2048");
  const [qty, setQty] = useState("12");
  const [reason, setReason] = useState("Recount");
  const [toStoreId, setToStoreId] = useState("MIN-BD-DHK-014");
  const [formError, setFormError] = useState("");
  const needsApprovalNote =
    user?.role === "warehouse_staff"
      ? "Large adjustments require Inventory Manager approval."
      : "Large adjustments create an approval request and audit event.";
  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transfers & Adjustments"
        description="Flow D · warehouse↔outlet moves · large changes need manager approval"
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            {tab === "transfer" ? "New transfer" : "New adjustment"}
          </Button>
        }
      />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "transfer", label: "Transfers" },
          { id: "adjust", label: "Adjustments", count: adjustments.length },
        ]}
      />

      <GlassCard className="mt-5 p-4 text-sm text-[var(--text-secondary)]">
        Stock states: <strong>In Transit</strong> · <strong>In Warehouse</strong>{" "}
        · <strong>At Outlet</strong>. Zero at outlet shows as out of stock to
        the social agent. {needsApprovalNote}
      </GlassCard>

      <SurfaceCard className="mt-4 overflow-hidden">
        {tab === "transfer" ? (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Transfer</th>
                <th className="px-3 py-3 font-medium">From</th>
                <th className="px-3 py-3 font-medium">To</th>
                <th className="px-3 py-3 font-medium">SKU</th>
                <th className="px-3 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
                >
                  <td className="px-5 py-3.5 font-medium">{t.id}</td>
                  <td className="px-3 py-3.5">{t.from}</td>
                  <td className="px-3 py-3.5">{t.to}</td>
                  <td className="px-3 py-3.5">{t.sku}</td>
                  <td className="px-3 py-3.5">{t.qty}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Pill tone={t.status === "Completed" ? "success" : "info"}>
                        {t.status}
                      </Pill>
                      {t.status === "In Transit" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            if (!token) return;
                            void api.receiveTransfer(token, t.id).then(() => reload());
                          }}
                        >
                          Receive
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Adjustment</th>
                <th className="px-3 py-3 font-medium">SKU</th>
                <th className="px-3 py-3 font-medium">Reason</th>
                <th className="px-3 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
                >
                  <td className="px-5 py-3.5 font-medium">{a.id}</td>
                  <td className="px-3 py-3.5">{a.sku}</td>
                  <td className="px-3 py-3.5">{a.reason}</td>
                  <td className="px-3 py-3.5 font-semibold">{a.qty}</td>
                  <td className="px-5 py-3.5">
                    <Pill
                      tone={
                        a.status === "Posted" ? "success" : "warning"
                      }
                    >
                      {a.status}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SurfaceCard>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={tab === "transfer" ? "Confirm transfer" : "Stock adjustment"}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (!token) return;
                setFormError("");
                const action =
                  tab === "transfer"
                    ? api.createTransfer(token, {
                        toStoreId,
                        sku,
                        qty: Number(qty),
                      })
                    : api.createAdjustment(token, {
                        sku,
                        qty: Number(qty),
                        reason,
                      });
                void action
                  .then(() => {
                    setOpen(false);
                    return reload();
                  })
                  .catch((error: Error) => setFormError(error.message));
              }}
            >
              {tab === "transfer" ? "Confirm transfer" : "Submit for approval"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          {formError && <p className="text-[var(--danger)]">{formError}</p>}
          {tab === "transfer" ? (
            <>
              <p>Stock leaves Dhaka DC and shows in transit at the branch until it is received.</p>
              <label className="block text-xs text-[var(--text-muted)]">
                Destination
                <select
                  value={toStoreId}
                  onChange={(e) => setToStoreId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-[var(--text-muted)]">
                SKU
                <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3" />
              </label>
              <label className="block text-xs text-[var(--text-muted)]">
                Quantity
                <input value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3" />
              </label>
            </>
          ) : (
            <>
              <p>This opens an approval. Stock does not change until an owner or inventory manager approves it.</p>
              <label className="block text-xs text-[var(--text-muted)]">
                SKU
                <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3" />
              </label>
              <label className="block text-xs text-[var(--text-muted)]">
                Quantity change
                <input value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3" />
              </label>
              <label className="block text-xs text-[var(--text-muted)]">
                Reason
                <input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3" />
              </label>
            </>
          )}
        </div>
      </SideDrawer>
    </div>
  );
}
