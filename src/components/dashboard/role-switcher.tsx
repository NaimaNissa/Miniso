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
    description: "Network management",
    icon: Building2,
  },
  {
    id: "branch",
    href: "/dashboard/branch",
    label: "Branch",
    description: "Store operations",
    icon: Store,
  },
];

export function RoleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1",
        className
      )}
    >
      {roles.map((role) => {
        const active = pathname.startsWith(role.href);
        const Icon = role.icon;
        return (
          <Link
            key={role.id}
            href={role.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{role.label}</span>
            <span className="hidden text-[11px] font-normal text-[var(--text-muted)] sm:inline">
              {role.description}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
