"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers";
import { useAuth } from "@/components/auth-provider";
import { roleMeta } from "@/lib/auth";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
  } = useApp();
  const { user, navGroups } = useAuth();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  if (!user) return null;

  const meta = roleMeta[user.role];
  const hrefs = navGroups.flatMap((group) =>
    group.items.map((item) => item.href)
  );
  const compact = sidebarCollapsed;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200",
          "w-[min(var(--sidebar-width),88vw)]",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          compact ? "lg:w-[72px]" : "lg:w-[var(--sidebar-width)]"
        )}
      >
        <div className="flex h-[var(--topbar-height)] items-center justify-between gap-2 border-b border-[var(--border)] px-3">
          <Link href={meta.home} className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[11px] font-bold text-white">
              M
            </div>
            <div className={cn("min-w-0", compact && "lg:hidden")}>
              <p className="truncate text-[13px] font-semibold tracking-tight">
                MINISO
              </p>
              <p className="truncate text-[10px] text-[var(--text-muted)]">
                {meta.shortLabel}
              </p>
            </div>
          </Link>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--background-elevated)] lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--background-elevated)] lg:flex"
            aria-label="Toggle sidebar"
          >
            {compact ? (
              <ChevronsRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronsLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {navGroups.map((group, groupIndex) => {
            const isPin = !group.label;
            const showDivider = groupIndex > 0 && !isPin;

            return (
              <div
                key={`${group.label || "pin"}-${groupIndex}`}
                className={cn(
                  showDivider && "mt-3 border-t border-[var(--border)] pt-3"
                )}
              >
                <p
                  className={cn(
                    "mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]",
                    compact && "lg:hidden",
                    !group.label && "sr-only"
                  )}
                >
                  {group.label || "Pinned"}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const nested =
                      item.href !== "/" &&
                      item.href !== "/stores" &&
                      pathname.startsWith(item.href + "/") &&
                      !hrefs.some(
                        (other) =>
                          other !== item.href &&
                          other.startsWith(item.href + "/") &&
                          (pathname === other ||
                            pathname.startsWith(other + "/"))
                      );
                    const active = pathname === item.href || nested;
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={item.label}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors",
                            active
                              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] hover:text-[var(--text-primary)]",
                            compact && "lg:justify-center lg:px-2"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active
                                ? "text-[var(--accent)]"
                                : "text-[var(--text-muted)]"
                            )}
                          />
                          <span
                            className={cn(
                              "flex-1 truncate",
                              compact && "lg:hidden"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none",
                                active
                                  ? "bg-[var(--accent)] text-white"
                                  : "bg-[var(--background-elevated)] text-[var(--text-muted)]",
                                compact && "lg:hidden"
                              )}
                            >
                              {item.badge}
                            </span>
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

        <div className="border-t border-[var(--border)] p-2.5">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2 py-2",
              compact && "lg:justify-center"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white">
              {user.initials}
            </div>
            <div className={cn("min-w-0 flex-1", compact && "lg:hidden")}>
              <p className="truncate text-[12px] font-medium">{user.name}</p>
              <p className="truncate text-[10px] text-[var(--text-muted)]">
                {user.workspace}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
