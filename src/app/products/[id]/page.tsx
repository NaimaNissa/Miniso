"use client";

import { use, useState } from "react";
import Link from "next/link";
import { products, stores } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { SurfaceCard, GlassCard } from "@/components/ui/glass-card";
import { Pill, StatusBadge } from "@/components/ui/status-badge";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = products.find((p) => p.id === id);
  const [tab, setTab] = useState("overview");

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Product not found</p>
        <Link href="/products" className="mt-2 inline-block text-sm text-[var(--accent)]">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Products
      </Link>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <GlassCard className="flex flex-col items-center justify-center p-8">
          <span className="text-7xl">{product.image}</span>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Product imagery
          </p>
        </GlassCard>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                SKU: {product.sku} · {product.brand} · {product.category}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-2xl font-semibold">
                  {formatCurrency(product.price)}
                </p>
                <Pill tone="success">Active</Pill>
                <StatusBadge status={product.inventoryStatus} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button size="sm">Transfer stock</Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Available", value: formatNumber(product.available) },
              { label: "In Transit", value: formatNumber(product.inTransit) },
              { label: "Reserved", value: formatNumber(product.reserved) },
              { label: "Stores", value: String(product.stores) },
            ].map((m) => (
              <SurfaceCard key={m.label} className="p-3">
                <p className="text-xs text-[var(--text-muted)]">{m.label}</p>
                <p className="mt-1 text-lg font-semibold">{m.value}</p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </div>

      <Tabs
        className="mt-6"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "inventory", label: "Inventory" },
          { id: "sales", label: "Sales" },
          { id: "stores", label: "Stores" },
          { id: "forecast", label: "Forecast" },
        ]}
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SurfaceCard className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Product performance</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Units sold (30d)",
                value: formatNumber(product.unitsSold30d),
              },
              {
                label: "Revenue (30d)",
                value: formatCurrency(product.revenue30d),
              },
              { label: "Margin", value: `${product.margin}%` },
              { label: "Sell-through", value: `${product.sellThrough}%` },
              {
                label: "Stock coverage",
                value: `${product.stockCoverage} days`,
              },
              { label: "Cost", value: formatCurrency(product.cost) },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs text-[var(--text-muted)]">{m.label}</p>
                <p className="mt-1 text-lg font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold">AI forecast</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Demand expected +14% next 7 days in Dhaka cluster. Recommend
            replenishing Dhanmondi and Gulshan before weekend peak.
          </p>
          <p className="mt-3 text-[11px] text-[var(--text-muted)]">
            Confidence 91% · Model: store×SKU weekly
          </p>
          <Button className="mt-4 w-full" variant="secondary" size="sm">
            Review replenishment
          </Button>
        </GlassCard>
      </div>

      <SurfaceCard className="mt-4 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold">Store distribution</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Store</th>
                <th className="px-3 py-3 font-medium">City</th>
                <th className="px-3 py-3 font-medium">On hand</th>
                <th className="px-5 py-3 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
                >
                  <td className="px-5 py-3.5 font-medium">{s.name}</td>
                  <td className="px-3 py-3.5 text-[var(--text-secondary)]">
                    {s.city}
                  </td>
                  <td className="px-3 py-3.5">
                    {[8, 42, 11, 6][i] ?? 10}
                  </td>
                  <td className="px-5 py-3.5">{s.stockAvailability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
