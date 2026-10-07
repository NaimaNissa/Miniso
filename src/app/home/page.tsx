"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { roleMeta } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomeModulesPage() {
  const { user, modules, roleLabel } = useAuth();
  if (!user) return null;

  const meta = roleMeta[user.role];

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0]}`}
        description={`${roleLabel} · ${modules.length} modules · ${user.workspace}`}
        actions={
          <Link href={meta.home === "/home" ? modules[0]?.href ?? "/home" : meta.home}>
            <Button size="sm">
              Open workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="accent">{meta.shortLabel}</Pill>
        <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.id} href={mod.href}>
              <SurfaceCard hover className="flex h-full items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {mod.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {mod.description}
                  </p>
                </div>
              </SurfaceCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
