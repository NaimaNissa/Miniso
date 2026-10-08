"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useAuth } from "@/components/auth-provider";
import { useRetail } from "@/components/retail-provider";
import { api } from "@/lib/api";

export default function ShipmentsPage() {
  const { user, token } = useAuth();
  const { shipments, ready, reload } = useRetail();
  const canCreate = user?.role === "inventory_manager" || user?.role === "owner";
  const canReceive =
    user?.role === "warehouse_staff" ||
    user?.role === "inventory_manager" ||
    user?.role === "owner";
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [invoice, setInvoice] = useState("");
  const [eta, setEta] = useState("");
  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;
  const inTransit = shipments.filter((item) => item.status === "In Transit").length;
  const receiving = shipments.filter((item) => item.status === "Receiving").length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Inbound Shipments"
        description="Flow B · Manager creates · Warehouse receives · stock available after approval"
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              New shipment
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "In transit", value: String(inTransit) },
          { label: "Receiving today", value: String(receiving) },
          { label: "Awaiting discrepancy review", value: "1" },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <SurfaceCard className="overflow-hidden">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Shipment</th>
              <th className="px-3 py-3 font-medium">Origin</th>
              <th className="px-3 py-3 font-medium">Invoice</th>
              <th className="px-3 py-3 font-medium">ETA</th>
              <th className="px-3 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr
                key={s.id}
                className="border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
              >
                <td className="px-5 py-3.5 font-medium">{s.id}</td>
                <td className="px-3 py-3.5">{s.origin}</td>
                <td className="px-3 py-3.5 text-[var(--text-secondary)]">
                  {s.invoice}
                </td>
                <td className="px-3 py-3.5">{s.eta}</td>
                <td className="px-3 py-3.5">{s.items}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Pill
                      tone={
                        s.status === "Received"
                          ? "success"
                          : s.status === "Receiving"
                            ? "warning"
                            : "info"
                      }
                    >
                      {s.status}
                    </Pill>
                    {canReceive && s.status !== "Received" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (!token) return;
                          void api.receiveShipment(token, s.id).then(() => reload());
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
      </SurfaceCard>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="New shipment"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (!token) return;
                void api
                  .createShipment(token, { origin, invoice, eta, items: 1 })
                  .then(() => {
                    setOpen(false);
                    return reload();
                  });
              }}
            >
              Save as In Transit
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <p className="text-[var(--text-secondary)]">
            Inventory Manager creates shipment with origin, invoice and ETA.
            Items can be typed or uploaded from a packing list. Missing SKUs
            become draft products.
          </p>
          <label className="block text-xs text-[var(--text-muted)]">
            Origin
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm outline-none" />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Invoice
            <input value={invoice} onChange={(e) => setInvoice(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm outline-none" />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            ETA
            <input value={eta} onChange={(e) => setEta(e.target.value)} className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm outline-none" />
          </label>
        </div>
      </SideDrawer>
    </div>
  );
}
