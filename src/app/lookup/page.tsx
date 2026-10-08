"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { StatusBadge, Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useRetail } from "@/components/retail-provider";
import { formatCurrency } from "@/lib/utils";
import { Copy, Search } from "lucide-react";

export default function ProductLookupPage() {
  const { products, stores, inventoryRows, promotions, ready } = useRetail();
  const [query, setQuery] = useState("Sanrio");
  const [copied, setCopied] = useState(false);
  const product = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products[0];
    return (
      products.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      ) ?? null
    );
  }, [products, query]);

  const stockByStore = stores.map((store) => ({
    store: store.name,
    qty:
      inventoryRows.find(
        (row) => row.productId === product?.id && row.storeId === store.id
      )?.stock ?? 0,
  }));
  const offer = promotions.find(
    (promo) => promo.status === "Active" && promo.category === product?.category
  );

  const reply = product
    ? `Hi! ${product.name} (${product.sku}) is ৳${product.price.toLocaleString()}. ${
        stockByStore.some((s) => s.qty > 0)
          ? `In stock at: ${stockByStore
              .filter((s) => s.qty > 0)
              .map((s) => `${s.store} (${s.qty})`)
              .join(", ")}.`
          : "Currently out of stock — next inbound ETA available on request."
      } ${offer?.note || "Ask the branch about current offers."}`
    : "";

  function copyReply() {
    navigator.clipboard?.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Product Lookup"
        description="Flow E · Social team search — photo, price, outlet stock, offers, copy reply"
      />

      <div className="mb-5 flex h-12 max-w-xl items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4">
        <Search className="h-4 w-4 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type name, SKU or category..."
          className="flex-1 bg-transparent text-sm outline-none"
          autoFocus
        />
      </div>

      {!product ? (
        <SurfaceCard className="py-16 text-center">
          <p className="font-semibold">Product not found</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Try other keywords or ask the Inventory Manager.
          </p>
        </SurfaceCard>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <SurfaceCard className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-28 w-28 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--background-elevated)] text-5xl">
                {product.image}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {product.sku} · {product.category} · {product.brand}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-2xl font-semibold">
                    {formatCurrency(product.price)}
                  </p>
                  <Pill tone="success">Active</Pill>
                  <StatusBadge status={product.inventoryStatus} />
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Social team can view price/stock/offers but cannot change
                  stock or prices.
                </p>
              </div>
            </div>

            <h3 className="mt-6 text-sm font-semibold">Stock by outlet</h3>
            <ul className="mt-3 space-y-2">
              {stockByStore.map((s) => (
                <li
                  key={s.store}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2.5 text-sm"
                >
                  <span>{s.store}</span>
                  {s.qty === 0 ? (
                    <Pill tone="danger">Out of stock</Pill>
                  ) : (
                    <span className="font-semibold">{s.qty} units</span>
                  )}
                </li>
              ))}
            </ul>

            <GlassCard className="mt-4 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Active offer
              </p>
              <p className="mt-1 text-sm">
                {offer?.note || "No category offer is active right now."}
              </p>
            </GlassCard>
          </SurfaceCard>

          <GlassCard className="flex flex-col p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Ready reply for customer
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-primary)]">
              {reply}
            </p>
            <Button className="mt-4 w-full" onClick={copyReply}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy reply"}
            </Button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
