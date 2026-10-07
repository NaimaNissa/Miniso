import { cn } from "@/lib/utils";
import type { InventoryStatus } from "@/lib/data";

const inventoryMap: Record<
  InventoryStatus,
  { label: string; className: string }
> = {
  healthy: {
    label: "Healthy",
    className: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  low: {
    label: "Low Stock",
    className: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  critical: {
    label: "Critical",
    className: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  out: {
    label: "Out of Stock",
    className: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  transit: {
    label: "In Transit",
    className: "bg-[var(--info-soft)] text-[var(--info)]",
  },
  reserved: {
    label: "Reserved",
    className: "bg-[var(--neutral-soft)] text-[var(--neutral)]",
  },
  damaged: {
    label: "Damaged",
    className: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  inspection: {
    label: "Pending Inspection",
    className: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: InventoryStatus;
  className?: string;
}) {
  const cfg = inventoryMap[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        cfg.className,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[var(--neutral-soft)] text-[var(--neutral)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
