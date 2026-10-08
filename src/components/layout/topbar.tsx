"use client";

import { useApp } from "@/components/providers";
import { useAuth } from "@/components/auth-provider";
import { roleMeta } from "@/lib/auth";
import { countries } from "@/lib/data";
import { useRetail } from "@/components/retail-provider";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Topbar() {
  const {
    theme,
    setTheme,
    scope,
    setScope,
    setCommandOpen,
    setAiOpen,
    notificationsOpen,
    setNotificationsOpen,
    sidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
  } = useApp();
  const { user, logout, modules, roleLabel } = useAuth();
  const { stores } = useRetail();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (scopeRef.current && !scopeRef.current.contains(target)) {
        setScopeOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-[var(--topbar-height)] items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/90 px-3 backdrop-blur-md transition-[left] duration-200 sm:gap-3 sm:px-5",
        "left-0",
        sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[var(--sidebar-width)]"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          onClick={() => setCommandOpen(true)}
          className="flex h-9 min-w-0 w-full max-w-xl items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-left transition-all hover:border-[var(--border-strong)] sm:h-10 sm:gap-3"
        >
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <span className="truncate text-sm text-[var(--text-muted)]">
            <span className="sm:hidden">Search…</span>
            <span className="hidden sm:inline">
              Search products, stores, SKUs…
            </span>
          </span>
          <kbd className="ml-auto hidden shrink-0 rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] md:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="relative hidden sm:block" ref={scopeRef}>
          <button
            onClick={() => {
              setScopeOpen(!scopeOpen);
              setProfileOpen(false);
            }}
            className="flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm transition-colors hover:border-[var(--border-strong)] sm:h-10 sm:px-3"
          >
            <span className="text-sm">
              {countries.find((c) => c.id === scope.countryId)?.flag ?? "🌐"}
            </span>
            <span className="hidden max-w-[7rem] truncate font-medium text-[var(--text-primary)] md:inline lg:max-w-[9rem]">
              {scope.storeName ?? scope.countryName}
            </span>
            <span className="hidden text-[var(--text-muted)] xl:inline">
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
                      : "text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
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
                      : "text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
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
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft-strong)] md:inline-flex md:h-10 md:w-auto md:gap-2 md:px-3"
          aria-label="Ask AI"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden text-sm font-medium lg:inline">Ask AI</span>
        </button>

        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] sm:h-10 sm:w-10"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        </button>

        {user && (
          <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setScopeOpen(false);
              }}
              className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-0.5 transition-colors hover:bg-[var(--background-elevated)] sm:pl-2 sm:pr-1"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium leading-tight text-[var(--text-primary)]">
                  {roleMeta[user.role].shortLabel}
                </p>
                <p className="text-[10px] leading-tight text-[var(--text-muted)]">
                  {modules.length} modules
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white sm:h-10 sm:w-10 sm:text-xs">
                {user.initials}
              </div>
              <ChevronDown
                className={cn(
                  "hidden h-3.5 w-3.5 text-[var(--text-muted)] transition-transform sm:block",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lg)] animate-fade-in"
              >
                <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {user.email}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">
                      {roleLabel} · {user.workspace}
                    </p>
                  </div>
                </div>

                <div className="my-1 border-t border-[var(--border)]" />

                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Appearance
                </p>
                <div className="grid grid-cols-2 gap-1.5 px-1 pb-1">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border px-2 py-2 text-xs font-medium transition-colors",
                      theme === "light"
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-elevated)]"
                    )}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                    {theme === "light" && <Check className="h-3 w-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border px-2 py-2 text-xs font-medium transition-colors",
                      theme === "dark"
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-elevated)]"
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                    {theme === "dark" && <Check className="h-3 w-3" />}
                  </button>
                </div>

                <div className="my-1 border-t border-[var(--border)]" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
