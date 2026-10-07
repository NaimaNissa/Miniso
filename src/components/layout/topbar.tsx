"use client";

import { useApp } from "@/components/providers";
import { useAuth } from "@/components/auth-provider";
import { roleMeta } from "@/lib/auth";
import { countries, stores } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Bell,
  Moon,
  Search,
  Sparkles,
  Sun,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Topbar() {
  const {
    theme,
    toggleTheme,
    scope,
    setScope,
    setCommandOpen,
    setAiOpen,
    notificationsOpen,
    setNotificationsOpen,
    sidebarCollapsed,
  } = useApp();
  const { user, logout, modules } = useAuth();
  const [scopeOpen, setScopeOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) {
        setScopeOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-[var(--topbar-height)] items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 transition-all duration-200 sm:px-6",
        sidebarCollapsed
          ? "left-[72px]"
          : "left-0 lg:left-[var(--sidebar-width)]"
      )}
    >
      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-10 flex-1 max-w-xl items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-left transition-all hover:border-[var(--border-strong)]"
      >
        <Search className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="flex-1 truncate text-sm text-[var(--text-muted)]">
          Search products, stores, SKUs...
        </span>
        <kbd className="hidden rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="relative" ref={scopeRef}>
        <button
          onClick={() => setScopeOpen(!scopeOpen)}
          className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm transition-colors hover:border-[var(--border-strong)]"
        >
          <span>
            {countries.find((c) => c.id === scope.countryId)?.flag ?? "🌐"}
          </span>
          <span className="hidden font-medium text-[var(--text-primary)] md:inline">
            {scope.storeName ?? scope.countryName}
          </span>
          <span className="hidden text-[var(--text-muted)] lg:inline">
            {scope.storeName ? scope.countryName : "All Stores"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        </button>

        {scopeOpen && (
          <div className="absolute right-0 top-12 z-50 w-64 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lg)] animate-fade-in">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Country
            </p>
            {countries.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setScope({
                    countryId: c.id,
                    countryName: c.name,
                    storeId: null,
                    storeName: null,
                  });
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm",
                  scope.countryId === c.id && !scope.storeId
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--border)]"
                )}
              >
                <span>{c.flag}</span>
                {c.name}
              </button>
            ))}
            <div className="my-1 border-t border-[var(--border)]" />
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Store
            </p>
            {stores.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setScope({
                    countryId: "bd",
                    countryName: "Bangladesh",
                    storeId: s.id,
                    storeName: s.name,
                  });
                  setScopeOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-[var(--radius-sm)] px-2 py-2 text-sm",
                  scope.storeId === s.id
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--border)]"
                )}
              >
                <span>{s.name}</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {s.city}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setAiOpen(true)}
        className="hidden h-10 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft-strong)] sm:inline-flex"
      >
        <Sparkles className="h-4 w-4" />
        Ask AI
      </button>

      <button
        onClick={toggleTheme}
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
      </button>

      {user && (
        <div className="hidden items-center gap-2 sm:flex">
          <div className="text-right">
            <p className="text-xs font-medium text-[var(--text-primary)]">
              {roleMeta[user.role].shortLabel}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {modules.length} modules
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
            {user.initials}
          </div>
          <button
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
