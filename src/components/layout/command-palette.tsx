"use client";

import { useApp } from "@/components/providers";
import { useRetail } from "@/components/retail-provider";
import { Search, Package, Store, Warehouse, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useApp();
  const { products, stores, warehouses, purchaseOrders } = useRetail();
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!commandOpen) setQuery("");
  }, [commandOpen]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return [
        ...products.slice(0, 3).map((p) => ({
          type: "Product",
          title: p.name,
          meta: p.sku,
          href: `/products/${p.id}`,
          icon: Package,
        })),
        ...stores.slice(0, 2).map((s) => ({
          type: "Store",
          title: s.name,
          meta: s.id,
          href: `/stores/${s.id}`,
          icon: Store,
        })),
      ];
    }
    return [
      ...products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        )
        .map((p) => ({
          type: "Product",
          title: p.name,
          meta: p.sku,
          href: `/products/${p.id}`,
          icon: Package,
        })),
      ...stores
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
        )
        .map((s) => ({
          type: "Store",
          title: s.name,
          meta: s.id,
          href: `/stores/${s.id}`,
          icon: Store,
        })),
      ...warehouses
        .filter((w) => w.name.toLowerCase().includes(q))
        .map((w) => ({
          type: "Warehouse",
          title: w.name,
          meta: w.id,
          href: "/warehouse",
          icon: Warehouse,
        })),
      ...purchaseOrders
        .filter((po) => po.id.toLowerCase().includes(q))
        .map((po) => ({
          type: "Purchase Order",
          title: po.id,
          meta: po.supplier,
          href: "/procurement",
          icon: FileText,
        })),
    ].slice(0, 8);
  }, [products, purchaseOrders, query, stores, warehouses]);

  if (!commandOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4">
      <button
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        aria-label="Close search"
        onClick={() => setCommandOpen(false)}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--glass-border)] bg-[var(--surface-glass-strong)] shadow-[var(--shadow-lg)] backdrop-blur-[22px] animate-fade-in">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, product, store, warehouse, PO..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
              No results for “{query}”
            </li>
          )}
          {results.map((r) => {
            const Icon = r.icon;
            return (
              <li key={`${r.type}-${r.title}`}>
                <button
                  className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left hover:bg-[var(--accent-soft)]"
                  onClick={() => {
                    setCommandOpen(false);
                    router.push(r.href);
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--background-elevated)] text-[var(--text-secondary)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {r.title}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {r.type} · {r.meta}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
