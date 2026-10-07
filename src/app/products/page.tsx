"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { StatusBadge, Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Products"
        description="SKU master · lifecycle, pricing and network availability"
        actions={
          <>
            <Button variant="outline" size="sm">
              Import
            </Button>
            <Button size="sm">Add product</Button>
          </>
        }
      />

      <div className="mb-4 flex h-10 max-w-md items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3">
        <Search className="h-4 w-4 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or SKUs..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <SurfaceCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">SKU</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Available</th>
                <th className="px-3 py-3 font-medium">Stores</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-[var(--border)] transition-colors hover:bg-[var(--background-elevated)]"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--background-elevated)] text-lg">
                        {p.image}
                      </span>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {p.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {p.brand}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-[var(--text-secondary)]">
                    {p.sku}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--text-muted)]">
                    {p.category}
                  </td>
                  <td className="px-3 py-3.5 font-medium">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-3 py-3.5">
                    {formatNumber(p.available)}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--text-secondary)]">
                    {p.stores}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Pill tone="success">Active</Pill>
                      <StatusBadge status={p.inventoryStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
