"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard, GlassCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SideDrawer } from "@/components/ui/side-drawer";
import { useRetail } from "@/components/retail-provider";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function PromotionsPage() {
  const { promotions, ready, reload, token } = useRetail();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");
  const [scope, setScope] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState("");
  const canRequest =
    user?.role === "owner" ||
    user?.role === "inventory_manager" ||
    user?.role === "store_manager";

  const active = promotions.filter((promo) => promo.status === "Active").length;
  const pending = promotions.filter(
    (promo) => promo.status === "Pending approval"
  ).length;

  async function createPromo() {
    if (!token || !canRequest) return;
    setBusy("create");
    setFormError("");
    try {
      await api.createApproval(token, {
        type: "price",
        promoName: name.trim(),
        promoPeriod: period.trim(),
        promoScope: scope.trim() || user?.workspace || "",
        promoCategory: category.trim(),
        promoNote: note.trim(),
        reason:
          reason.trim() ||
          `Activate campaign "${name.trim()}" across ${scope.trim() || "network"}`,
        inventoryImpact: "Margin / offer change",
        risk: "low",
      });
      setCreateOpen(false);
      setName("");
      setPeriod("");
      setScope("");
      setCategory("");
      setNote("");
      setReason("");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy("");
    }
  }

  async function submitExisting(id: string, promoName: string) {
    if (!token || !canRequest) return;
    setBusy(id);
    setFormError("");
    try {
      await api.createApproval(token, {
        type: "price",
        promotionId: id,
        title: promoName,
        reason: `Request activation for ${promoName}`,
        inventoryImpact: "Margin / offer change",
        risk: "low",
      });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy("");
    }
  }

  if (!ready) return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Promotions"
        description="Campaigns stay pending until HQ approves price impact"
        actions={
          canRequest ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              Create promotion
            </Button>
          ) : undefined
        }
      />

      {formError && (
        <p className="mb-4 text-sm text-[var(--danger)]">{formError}</p>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active campaigns", value: String(active) },
          { label: "Pending approval", value: String(pending) },
          { label: "Total campaigns", value: String(promotions.length) },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-3">
        {promotions.map((p) => (
          <SurfaceCard
            key={p.id}
            className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{p.name}</h2>
                <Pill
                  tone={
                    p.status === "Active"
                      ? "success"
                      : p.status === "Pending approval"
                        ? "warning"
                        : p.status === "Declined"
                          ? "danger"
                          : "info"
                  }
                >
                  {p.status}
                </Pill>
              </div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {p.period} · {p.scope}
              </p>
              {p.note ? (
                <p className="mt-2 text-xs text-[var(--text-muted)]">{p.note}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              {p.status === "Scheduled" && canRequest ? (
                <Button
                  size="sm"
                  disabled={busy === p.id}
                  onClick={() => void submitExisting(p.id, p.name)}
                >
                  Submit for approval
                </Button>
              ) : p.status === "Pending approval" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = "/approvals";
                  }}
                >
                  View in approvals
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  {p.status === "Active" ? "Live" : "View"}
                </Button>
              )}
            </div>
          </SurfaceCard>
        ))}
      </div>

      <SideDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create promotion"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={busy === "create" || !name.trim()}
              onClick={() => void createPromo()}
            >
              Submit for approval
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-[var(--text-secondary)]">
            Opens a price approval. Approving activates the campaign for POS.
          </p>
          <label className="block text-xs text-[var(--text-muted)]">
            Campaign name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Period
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              placeholder="10–17 Oct 2026"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Scope
            <input
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              placeholder="All stores · Gold+"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Reason for reviewers
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 py-2 text-sm"
            />
          </label>
        </div>
      </SideDrawer>
    </div>
  );
}
