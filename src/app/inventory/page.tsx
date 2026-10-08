"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useRetail } from "@/components/retail-provider";
import { formatNumber } from "@/lib/utils";
import { Download, Filter, Search, SlidersHorizontal } from "lucide-react";

export default function InventoryPage() {
  const { inventoryRows, ready } = useRetail();
  const [tab, setTab] = useState("stock");
  const [selected, setSelected] = useState<(typeof inventoryRows)[0] | null>(
    null
  );
  const [query, setQuery] = useState("");
  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;

  const filtered = inventoryRows.filter(
    (r) =>
      r.sku.toLowerCase().includes(query.toLowerCase()) ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.store.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Inventory"
        description="Network stock ledger · available excludes reserved, damaged & in-transit"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm">Create transfer</Button>
          </>
        }
      />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "stock", label: "Stock" },
          { id: "transfers", label: "Transfers", count: 6 },
          { id: "adjustments", label: "Adjustments", count: 3 },
        ]}
      />

      <GlassCard className="mt-5 p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Inventory Health
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Available", value: "1.24M", tone: "success" },
            { label: "Reserved", value: "84K", tone: "neutral" },
            { label: "In Transit", value: "126K", tone: "info" },
            { label: "Damaged / QC", value: "2.1K", tone: "danger" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, product, store..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
        <Button variant="outline" size="md">
          <Filter className="h-3.5 w-3.5" />
          Store
        </Button>
        <Button variant="outline" size="md">
          Warehouse
        </Button>
        <Button variant="outline" size="md">
          Status
        </Button>
        <Button variant="ghost" size="md">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Columns
        </Button>
      </div>

      <SurfaceCard className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">
                  <input type="checkbox" className="rounded" aria-label="Select all" />
                </th>
                <th className="px-3 py-3 font-medium">SKU</th>
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Store</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={`${row.sku}-${row.store}`}
                  onClick={() => setSelected(row)}
                  className="cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--background-elevated)]"
                  style={{ height: 52 }}
                >
                  <td className="px-5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded" aria-label={`Select ${row.sku}`} />
                  </td>
                  <td className="px-3 font-medium text-[var(--text-primary)]">
                    {row.sku}
                  </td>
                  <td className="px-3 text-[var(--text-secondary)]">{row.name}</td>
                  <td className="px-3 text-[var(--text-muted)]">
                    {row.category}
                  </td>
                  <td className="px-3 text-[var(--text-secondary)]">
                    {row.store}
                  </td>
                  <td className="px-3 font-semibold">{formatNumber(row.stock)}</td>
                  <td className="px-3 text-[var(--text-muted)]">{row.target}</td>
                  <td className="px-5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--text-muted)]">
          <span>
            Showing {filtered.length} of {inventoryRows.length} rows
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </SurfaceCard>

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Inventory detail"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
            <Button className="flex-1">Adjust stock</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-muted)]">SKU</p>
              <p className="text-lg font-semibold">{selected.sku}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {selected.name}
              </p>
            </div>
            <StatusBadge status={selected.status} />
            <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Current stock</p>
                <p className="text-xl font-semibold">{selected.stock}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Target</p>
                <p className="text-xl font-semibold">{selected.target}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Store</p>
                <p className="font-medium">{selected.store}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Category</p>
                <p className="font-medium">{selected.category}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Adjustments create ledger transactions and may require approval
              above threshold. Available stock never edits as a raw number.
            </p>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
