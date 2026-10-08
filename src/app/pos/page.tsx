"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useRetail } from "@/components/retail-provider";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  Trash2,
} from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

export default function POSPage() {
  const { user, token } = useAuth();
  const { posCatalog, branchToday, ready, reload } = useRetail();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  const catalog = useMemo(
    () =>
      posCatalog.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      ),
    [posCatalog, query]
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function addToCart(p: (typeof posCatalog)[0]) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      const nextQty = (existing?.qty ?? 0) + 1;
      if (p.available < nextQty) {
        setMessage(`Only ${p.available} ${p.name} left at this branch`);
        return prev;
      }
      setMessage("");
      if (existing) {
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: nextQty } : i
        );
      }
      return [
        ...prev,
        { id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 },
      ];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  async function pay(tender: "cash" | "card") {
    if (!token || cart.length === 0) return;
    setPaying(true);
    setMessage("");
    try {
      const sale = await api.checkout(token, {
        storeId: branchToday.storeId,
        tender,
        lines: cart.map((item) => ({ productId: item.id, qty: item.qty })),
      });
      setCart([]);
      setMessage(`Sale ${sale.id} posted · stock updated`);
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  if (!ready) {
    return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
      <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-sm font-semibold">POS · {branchToday.storeName}</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {user?.name ?? "Cashier"} · {message || "Stock updates when you take payment"}
            </p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-xs font-bold text-white">
          M
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="flex min-h-0 flex-1 flex-col p-4">
          <div className="flex gap-2">
            <div className="flex h-14 flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4">
              <Search className="h-5 w-5 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or scan barcode..."
                className="flex-1 bg-transparent text-base outline-none"
                autoFocus
              />
            </div>
            <button className="flex h-14 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-soft)] px-5 text-sm font-semibold text-[var(--accent)]">
              <ScanBarcode className="h-5 w-5" />
              Scan
            </button>
          </div>

          <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 xl:grid-cols-4">
            {catalog.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="flex min-h-[140px] flex-col items-start rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-all hover:border-[var(--accent-soft)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98]"
              >
                <span className="text-3xl">{p.image}</span>
                <p className="mt-3 line-clamp-2 text-sm font-medium">
                  {p.name}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {p.available > 0 ? `${p.available} in branch` : "Out at this branch"}
                </p>
                <p className="mt-auto pt-2 text-base font-semibold text-[var(--accent)]">
                  {formatCurrency(p.price)}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className="flex w-full flex-col border-t border-[var(--border)] bg-[var(--surface)] lg:w-[380px] lg:border-l lg:border-t-0">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-base font-semibold">Current Cart</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {cart.length} line items
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--text-muted)]">
                Scan or tap products to add
              </p>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3"
                  >
                    <span className="text-2xl">{item.image}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--background-elevated)]"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--background-elevated)]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        setCart((c) => c.filter((i) => i.id !== item.id))
                      }
                      className="text-[var(--text-muted)] hover:text-[var(--danger)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-[var(--border)] p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Discount</span>
                <span>৳ 0</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="secondary"
                disabled={cart.length === 0 || paying}
                className="h-14 text-base"
                onClick={() => pay("cash")}
              >
                Cash
              </Button>
              <Button
                size="lg"
                disabled={cart.length === 0 || paying}
                className="h-14 text-base"
                onClick={() => pay("card")}
              >
                Card
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
