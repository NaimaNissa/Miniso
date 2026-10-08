"use client";

import { useApp } from "@/components/providers";
import { useRetail } from "@/components/retail-provider";
import { cn } from "@/lib/utils";

export function NotificationsPanel() {
  const { notificationsOpen, setNotificationsOpen, sidebarCollapsed } =
    useApp();
  const { notifications } = useRetail();

  if (!notificationsOpen) return null;

  const groups = [
    {
      label: "Critical",
      tone: "danger" as const,
      items: notifications.critical,
    },
    {
      label: "Attention",
      tone: "warning" as const,
      items: notifications.attention,
    },
    { label: "Information", tone: "info" as const, items: notifications.info },
  ];

  const toneDot = {
    danger: "bg-[var(--danger)]",
    warning: "bg-[var(--warning)]",
    info: "bg-[var(--info)]",
  };

  return (
    <>
      <button
        className="fixed inset-0 z-40"
        aria-label="Close notifications"
        onClick={() => setNotificationsOpen(false)}
      />
      <div
        className={cn(
          "fixed top-[calc(var(--topbar-height)+8px)] right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-fade-in",
          sidebarCollapsed ? "" : ""
        )}
      >
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Notifications
          </h3>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {groups.map((g) => (
            <div key={g.label} className="mb-2">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {g.label}
              </p>
              {g.items.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-start gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left hover:bg-[var(--background-elevated)]"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      toneDot[g.tone]
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.meta}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
