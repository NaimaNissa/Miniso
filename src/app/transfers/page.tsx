"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useAuth } from "@/components/auth-provider";

const transfers = [
  {
    id: "TR-DHK-229",
    from: "Dhaka DC",
    to: "Dhanmondi Store",
    sku: "SKU-2048",
    qty: 24,
    status: "In Transit",
  },
  {
    id: "TR-UTT-118",
    from: "Dhaka DC",
    to: "Uttara Store",
    sku: "SKU-1102",
    qty: 40,
    status: "Completed",
  },
];

const adjustments = [
  {
    id: "ADJ-441",
    sku: "SKU-8891",
    reason: "Damage",
    qty: -6,
    status: "Pending approval",
  },
  {
    id: "ADJ-438",
    sku: "SKU-301",
    reason: "Recount",
    qty: +2,
    status: "Posted",
  },
];

export default function TransfersPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("transfer");
  const [open, setOpen] = useState(false);
  const needsApprovalNote =
    user?.role === "warehouse_staff"
      ? "Large adjustments require Inventory Manager approval."
      : "Large adjustments create an approval request and audit event.";

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
          { id: "adjust", label: "Adjustments", count: 1 },
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
                    <Pill
                      tone={t.status === "Completed" ? "success" : "info"}
                    >
                      {t.status}
                    </Pill>
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
            <Button className="flex-1" onClick={() => setOpen(false)}>
              {tab === "transfer" ? "Confirm transfer" : "Submit for approval"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          {tab === "transfer" ? (
            <>
              <p>Choose outlet, products and quantities. Source stock is reserved before dispatch.</p>
              {["Destination outlet", "SKU", "Quantity"].map((f) => (
                <div key={f}>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">
                    {f}
                  </label>
                  <input className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3" />
                </div>
              ))}
            </>
          ) : (
            <>
              <p>Reason: damage, recount or return. Large changes need manager approval.</p>
              {["SKU", "Quantity change", "Reason"].map((f) => (
                <div key={f}>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">
                    {f}
                  </label>
                  <input className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3" />
                </div>
              ))}
            </>
          )}
        </div>
      </SideDrawer>
    </div>
  );
}
