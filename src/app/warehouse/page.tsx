"use client";

import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { warehouseTasks, warehouses } from "@/lib/data";
import { ScanBarcode } from "lucide-react";

const workflows = [
  "Inbound",
  "Receiving",
  "Put Away",
  "Picking",
  "Packing",
  "Dispatch",
  "Transfers",
  "Stock Count",
  "Damaged",
];

const statusTone = {
  pending: "neutral" as const,
  in_progress: "info" as const,
  waiting: "warning" as const,
  completed: "success" as const,
  exception: "danger" as const,
};

const statusLabel = {
  pending: "Pending",
  in_progress: "In Progress",
  waiting: "Waiting",
  completed: "Completed",
  exception: "Exception",
};

export default function WarehousePage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Warehouses"
        description="Inbound, put-away, pick, pack and dispatch workflows"
        actions={
          <Button size="sm">
            <ScanBarcode className="h-3.5 w-3.5" />
            Scan barcode
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {warehouses.map((wh) => (
          <GlassCard key={wh.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{wh.name}</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {wh.id} · {wh.city}
                </p>
              </div>
              <Pill tone="info">{wh.capacity}% capacity</Pill>
            </div>
            <div className="mt-4 flex gap-6 text-sm">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Inbound</p>
                <p className="text-lg font-semibold">{wh.inbound}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Outbound</p>
                <p className="text-lg font-semibold">{wh.outbound}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {workflows.map((w, i) => (
          <button
            key={w}
            className={`shrink-0 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors ${
              i === 1
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      <SurfaceCard className="mt-4 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold">Active warehouse tasks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Reference</th>
                <th className="px-3 py-3 font-medium">Assignee</th>
                <th className="px-3 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouseTasks.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
                >
                  <td className="px-5 py-3.5 font-medium">{t.id}</td>
                  <td className="px-3 py-3.5">{t.type}</td>
                  <td className="px-3 py-3.5 text-[var(--text-secondary)]">
                    {t.ref}
                  </td>
                  <td className="px-3 py-3.5">{t.assignee}</td>
                  <td className="px-3 py-3.5">
                    <Pill
                      tone={
                        t.priority === "high"
                          ? "danger"
                          : t.priority === "medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {t.priority}
                    </Pill>
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill tone={statusTone[t.status]}>
                      {statusLabel[t.status]}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <GlassCard className="mt-4 flex flex-col items-center justify-center gap-3 p-8 sm:flex-row sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Barcode scanning ready</p>
          <p className="text-xs text-[var(--text-muted)]">
            Scan ASN, location, or tote to advance receiving workflow
          </p>
        </div>
        <Button>
          <ScanBarcode className="h-4 w-4" />
          Open scanner
        </Button>
      </GlassCard>
    </div>
  );
}
