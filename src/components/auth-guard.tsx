"use client";

import { useAuth } from "@/components/auth-provider";
import { roleMeta } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/glass-card";
import { ShieldAlert } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, ready, canAccessPath, modules } = useAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (!ready) return;
    if (!user && !isLogin && pathname !== "/") {
      router.replace("/login");
      return;
    }
    if (user && isLogin) {
      router.replace(roleMeta[user.role].home);
    }
  }, [ready, user, isLogin, pathname, router]);

  // Always keep login page HTML stable (redirect only via effect).
  if (isLogin) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-40 skeleton" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--text-muted)]">Redirecting to login…</p>
      </div>
    );
  }

  if (!canAccessPath(pathname)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <SurfaceCard className="w-full p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold">Module not available</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Your role ({roleMeta[user.role].label}) does not include this
            module. Choose one of your assigned modules below.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {modules.slice(0, 6).map((m) => (
              <Link key={m.id} href={m.href}>
                <Button variant="outline" size="sm">
                  {m.name}
                </Button>
              </Link>
            ))}
          </div>
          <Link href="/home" className="mt-4 inline-block">
            <Button size="sm">Back to my modules</Button>
          </Link>
        </SurfaceCard>
      </div>
    );
  }

  return <>{children}</>;
}
