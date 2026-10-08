"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, Store } from "lucide-react";

const roles = [
  {
    id: "owner",
    href: "/dashboard/owner",
    label: "Owner",
    description: "Network",
    icon: Building2,
  },
  {
    id: "branch",
    href: "/dashboard/branch",
    label: "Branch",
    description: "Stores",
    icon: Store,
  },
];

export function RoleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "inline-flex w-full items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--background-elevated)] p-1 sm:w-auto",
        className
      )}
      role="tablist"
      aria-label="Dashboard view"
    >
      {roles.map((role) => {
        const active = pathname?.startsWith(role.href);
        const Icon = role.icon;
        return (
          <Link
            key={role.id}
            href={role.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150 sm:flex-none",
              active
                ? "bg-[var(--surface)] text-[var(--accent)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{role.label}</span>
            <span className="hidden text-[11px] font-normal text-[var(--text-muted)] md:inline">
              {role.description}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
