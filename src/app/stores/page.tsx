import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { stores } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function StoresPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Stores"
        description="Branch network · operational control centers"
        actions={<Button size="sm">Add store</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <Link key={store.id} href={`/stores/${store.id}`}>
            <SurfaceCard hover className="h-full p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">
                    {store.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {store.city}, {store.country}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
                    {store.id}
                  </p>
                </div>
                <Pill
                  tone={
                    store.status === "operational" ? "success" : "warning"
                  }
                >
                  {store.status === "operational"
                    ? "Operational"
                    : "Maintenance"}
                </Pill>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Today&apos;s sales
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(store.salesToday)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Stock available
                  </p>
                  <p className="text-lg font-semibold">
                    {store.stockAvailability}%
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--text-secondary)]">
                Manager: {store.manager} · Staff {store.staffPresent}/
                {store.staffTotal}
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
