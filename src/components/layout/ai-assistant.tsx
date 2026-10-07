"use client";

import { useApp } from "@/components/providers";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

const suggestions = [
  "Which stores are likely to run out of Sanrio plush this week?",
  "Show pending approvals with inventory impact",
  "Recommend transfers for low-stock stationery",
];

export function AIAssistant() {
  const { aiOpen, setAiOpen } = useApp();
  const { user, canAccess } = useAuth();
  const [query, setQuery] = useState("");
  const [answered, setAnswered] = useState(false);

  if (!user) return null;

  if (
    !canAccess("ai") &&
    !canAccess("owner_dashboard") &&
    !canAccess("branch_dashboard")
  ) {
    return null;
  }

  if (!aiOpen) {
    return (
      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Sparkles className="h-4 w-4" />
        Ask Retail AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--glass-border)] bg-[var(--surface-glass-strong)] shadow-[var(--shadow-lg)] backdrop-blur-[22px] animate-fade-in">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Retail AI
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              Recommends · humans approve
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setAiOpen(false);
            setAnswered(false);
            setQuery("");
          }}
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--border)]"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
        {!answered ? (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              Ask about inventory risk, replenishment, transfers, or store
              performance.
            </p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    setAnswered(true);
                  }}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left text-xs text-[var(--text-primary)] transition-colors hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="rounded-[var(--radius-md)] bg-[var(--background-elevated)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              “{query || suggestions[0]}”
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                AI Analysis
              </p>
              <p className="mt-2 text-sm text-[var(--text-primary)]">
                12 stores are at high risk of stockout on Sanrio Plush Bear
                (SKU-2048) within 7 days.
              </p>
              <p className="mt-3 text-xs font-medium text-[var(--text-secondary)]">
                Highest risk
              </p>
              <ol className="mt-1 space-y-1 text-sm text-[var(--text-primary)]">
                <li>1. Dhanmondi — 8 units · 2.1 days cover</li>
                <li>2. Gulshan — 4 units · 1.4 days cover</li>
                <li>3. Uttara — 11 units · 3.0 days cover</li>
              </ol>
              <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--accent-soft)] p-2.5">
                <p className="text-xs font-medium text-[var(--accent)]">
                  Recommended transfer
                </p>
                <p className="mt-0.5 text-sm text-[var(--text-primary)]">
                  Gulshan excess zone → Dhanmondi · 24 units
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Confidence 94%</span>
                <span>Data as of today 11:40</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                Why: sell-through 72%, inbound ETA 5d, local demand +18% WoW.
                Approving creates a reserved transfer — inventory does not
                move until warehouse dispatch.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setAiOpen(false);
                setAnswered(false);
              }}
            >
              Review Recommendation
            </Button>
          </div>
        )}
      </div>

      {!answered && (
        <div className="border-t border-[var(--border)] p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) setAnswered(true);
            }}
            className="flex gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Retail AI..."
              className="h-10 flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
            <Button type="submit" size="md">
              Ask
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
