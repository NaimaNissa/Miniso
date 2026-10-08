"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/status-badge";
import { useRetail } from "@/components/retail-provider";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const channels = ["All", "Instagram", "WhatsApp", "Facebook", "Other"];

export default function SocialPage() {
  const { user } = useAuth();
  const { ready, conversations, socialMessages, branchToday } = useRetail();
  const [channel, setChannel] = useState("All");
  const [activeId, setActiveId] = useState("");
  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0];
  const isBranchScoped =
    user?.role === "store_manager" || user?.role === "social_media";

  if (!ready) {
    return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;
  }
  if (!active) {
    return (
      <div className="py-16 text-center text-sm text-[var(--text-muted)]">
        No conversations for this branch yet.
      </div>
    );
  }

  const filtered =
    channel === "All"
      ? conversations
      : conversations.filter((c) => c.channel === channel);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Social agent"
        description={
          isBranchScoped
            ? `${branchToday.storeName} · Instagram, WhatsApp & more — answers from live branch stock`
            : "Customer conversations with AI-assisted product & stock lookup"
        }
        actions={
          isBranchScoped ? (
            <>
              <Pill tone="success">Linked to {branchToday.storeName}</Pill>
              <Link href="/dashboard/branch">
                <Button variant="outline" size="sm">
                  Branch dashboard
                </Button>
              </Link>
              <Link href="/lookup">
                <Button variant="outline" size="sm">
                  Product lookup
                </Button>
              </Link>
            </>
          ) : undefined
        }
      />

      <div className="grid h-[calc(100vh-12rem)] min-h-[560px] gap-4 lg:grid-cols-[240px_1fr_280px]">
        <SurfaceCard className="flex flex-col overflow-hidden">
          <div className="border-b border-[var(--border)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Conversations
            </p>
            <div className="flex flex-wrap gap-1">
              {channels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium",
                    channel === ch
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--border)]"
                  )}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "w-full rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors",
                    activeId === c.id
                      ? "bg-[var(--accent-soft)]"
                      : "hover:bg-[var(--background-elevated)]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{c.customer}</p>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {c.time}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                    {c.channel} · {c.preview}
                  </p>
                  {c.unread && (
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{active.customer}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {active.channel}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Take Over
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {socialMessages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm",
                  m.sender === "customer" &&
                    "ml-auto bg-[var(--accent)] text-white",
                  m.sender === "ai" &&
                    "border border-[var(--info)]/20 bg-[var(--info-soft)] text-[var(--text-primary)]",
                  m.sender === "system" &&
                    "mx-auto max-w-full bg-[var(--background-elevated)] text-center text-[11px] text-[var(--text-muted)]"
                )}
              >
                {m.sender === "ai" && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--info)]">
                    AI Reply
                  </p>
                )}
                {m.sender === "customer" && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    Customer
                  </p>
                )}
                {m.text}
                {m.sender !== "system" && (
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      m.sender === "customer"
                        ? "text-white/60"
                        : "text-[var(--text-muted)]"
                    )}
                  >
                    {m.time}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border)] p-3">
            <input
              placeholder="Type a reply or let AI draft..."
              className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm outline-none"
            />
          </div>
        </SurfaceCard>

        <GlassCard className="flex flex-col overflow-hidden p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            AI Findings
          </p>
          <div className="mt-3 space-y-3 text-sm">
            {[
              ["Product", "Sanrio Plush Bear"],
              ["Price", "৳ 1,250"],
              ["Stock", "8 at Dhanmondi"],
              ["Nearest Store", "Gulshan · 42 units"],
              ["ETA", "In-store now"],
              ["Offer", "1.5× Gold points"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">{k}</span>
                <span className="text-right font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pill tone="info">AI Confidence: {active.aiConfidence}%</Pill>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Social agents can answer from approved data but cannot mutate
            inventory or take orders.
          </p>
          <Button className="mt-auto" variant="secondary">
            Take Over
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
