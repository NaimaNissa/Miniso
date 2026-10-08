"use client";

import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useRetail } from "@/components/retail-provider";

export default function ReportsPage() {
  const { salesSparkline, inventorySparkline, ready } = useRetail();
  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        description="Control tower KPIs · inventory, supply, store and customer"
        actions={
          <Button variant="outline" size="sm">
            Schedule export
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="p-5">
          <h2 className="text-sm font-semibold">Sales trend (12 weeks)</h2>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {salesSparkline.length > 0 && salesSparkline.map((v, i) => {
              const max = Math.max(...salesSparkline);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-[4px] bg-[var(--accent)]"
                  style={{
                    height: `${(v / max) * 100}%`,
                    opacity: 0.35 + (i / salesSparkline.length) * 0.65,
                  }}
                />
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Dominant accent · neutral supporting tones
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <h2 className="text-sm font-semibold">Inventory availability %</h2>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {inventorySparkline.length > 0 && inventorySparkline.map((v, i) => {
              const min = Math.min(...inventorySparkline) - 5;
              const max = Math.max(...inventorySparkline);
              const h = ((v - min) / (max - min)) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-[4px] bg-[var(--success)]"
                  style={{ height: `${h}%`, opacity: 0.45 + (i / 12) * 0.55 }}
                />
              );
            })}
          </div>
        </SurfaceCard>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Stockout %", value: "2.8%", note: "−0.6 pts WoW" },
          { label: "Inventory turnover", value: "6.4×", note: "Rolling 90d" },
          { label: "Supplier OTIF", value: "91%", note: "+2 pts MoM" },
          { label: "Forecast error", value: "11.2%", note: "MAPE weekly" },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">{k.note}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
