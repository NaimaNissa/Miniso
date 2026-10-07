"use client";

import { useApp } from "@/components/providers";
import { AuthGuard } from "@/components/auth-guard";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { NotificationsPanel } from "./notifications-panel";
import { AIAssistant } from "./ai-assistant";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useApp();
  const pathname = usePathname() ?? "";
  const mounted = useMounted();
  const isLogin = pathname === "/login";
  const isPOS = pathname.startsWith("/pos");

  // SSR + first client paint: same minimal tree (avoids React #418).
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--background)]" suppressHydrationWarning>
        {isLogin || pathname === "/" ? children : null}
      </div>
    );
  }

  return (
    <AuthGuard>
      {isLogin ? (
        children
      ) : isPOS ? (
        <>
          {children}
          <CommandPalette />
        </>
      ) : (
        <div className="min-h-screen">
          <Sidebar />
          <Topbar />
          <main
            className={cn(
              "min-h-screen pt-[var(--topbar-height)] transition-all duration-200",
              sidebarCollapsed
                ? "pl-[72px]"
                : "pl-0 lg:pl-[var(--sidebar-width)]"
            )}
          >
            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <CommandPalette />
          <NotificationsPanel />
          <AIAssistant />
        </div>
      )}
    </AuthGuard>
  );
}
