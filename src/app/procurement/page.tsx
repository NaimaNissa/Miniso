"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { purchaseOrders, poTimeline } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusMap = {
  in_transit: { label: "In Transit", tone: "info" as const },
  pending_approval: { label: "Pending Approval", tone: "warning" as const },
  received: { label: "Received", tone: "success" as const },
  supplier_confirmed: { label: "Supplier Confirmed", tone: "accent" as const },
};

export default function ProcurementPage() {
  const [selected, setSelected] = useState<(typeof purchaseOrders)[0] | null>(
    null
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Procurement"
        description="Purchase orders, suppliers and inbound supply"
        actions={<Button size="sm">Create PO</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Purchase Orders", value: "48" },
          { label: "Pending Approval", value: "5" },
          { label: "In Transit", value: "12" },
          { label: "Supplier Issues", value: "2" },
          { label: "Expected Arrivals", value: "7" },
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
              {purchaseOrders.map((po) => (
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
                    <Pill tone={statusMap[po.status].tone}>
                      {statusMap[po.status].label}
                    </Pill>
                  </td>
                </tr>
              ))}
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
            <Button className="flex-1">Track shipment</Button>
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
    </div>
  );
}
