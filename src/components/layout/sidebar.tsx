"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers";
import { useAuth } from "@/components/auth-provider";
import { roleMeta } from "@/lib/auth";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const { user, navGroups, logout } = useAuth();

  if (!user) return null;

  const meta = roleMeta[user.role];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200",
        sidebarCollapsed ? "w-[72px]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className="flex h-[var(--topbar-height)] items-center justify-between gap-2 border-b border-[var(--border)] px-3">
        <Link href={meta.home} className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-[11px] font-bold text-white">
            M
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-tight">
                MINISO
              </p>
              <p className="truncate text-[10px] text-[var(--text-muted)]">
                {meta.shortLabel}
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--background-elevated)] lg:flex"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navGroups.map((group, groupIndex) => {
          const isPin = !group.label;
          const showDivider = groupIndex > 0 && !isPin;

          return (
            <div
              key={`${group.label || "pin"}-${groupIndex}`}
              className={cn(showDivider && "mt-3 border-t border-[var(--border)] pt-3")}
            >
              {!sidebarCollapsed && group.label && (
                <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const exact = pathname === item.href;
                  const nested =
                    item.href !== "/" &&
                    pathname.startsWith(item.href + "/") &&
                    item.href !== "/stores";
                  const active = exact || nested;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.label}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                          active
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] hover:text-[var(--text-primary)]",
                          sidebarCollapsed && "justify-center px-2"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[15px] w-[15px] shrink-0",
                            active
                              ? "text-[var(--accent)]"
                              : "text-[var(--text-muted)]"
                          )}
                        />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge !== undefined && (
                              <span
                                className={cn(
                                  "min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none",
                                  active
                                    ? "bg-[var(--accent)] text-white"
                                    : "bg-[var(--background-elevated)] text-[var(--text-muted)]"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1.5",
            sidebarCollapsed && "justify-center"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent)]">
            {user.initials}
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium">{user.name}</p>
                <p className="truncate text-[10px] text-[var(--text-muted)]">
                  {user.workspace}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--background-elevated)] hover:text-[var(--danger)]"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
