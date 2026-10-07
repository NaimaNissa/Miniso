import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { GlassCard } from "./glass-card";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

export function KPICard({
  label,
  value,
  prefix,
  suffix,
  change,
  changeLabel = "vs yesterday",
  icon: Icon,
  sparkline,
  accent,
  format = "number",
  compact = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  sparkline?: number[];
  accent?: boolean;
  format?: "number" | "currency" | "percent";
  compact?: boolean;
}) {
  const display =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
        ? `${value}%`
        : prefix
          ? `${prefix}${formatNumber(value)}`
          : formatNumber(value);

  const positive = change !== undefined && change >= 0;

  return (
    <GlassCard
      hover
      className={cn(
        "animate-fade-in",
        compact ? "p-3.5" : "p-4",
        accent && "ring-1 ring-[var(--accent-soft)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </p>
        {Icon && (
          <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
        )}
      </div>
      <p
        className={cn(
          "mt-2 font-semibold tracking-tight text-[var(--text-primary)]",
          compact ? "text-xl" : "text-2xl"
        )}
      >
        {display}
        {suffix && (
          <span className="ml-1 text-sm font-medium text-[var(--text-muted)]">
            {suffix}
          </span>
        )}
      </p>
      {change !== undefined && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              positive ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-[var(--text-muted)]">{changeLabel}</span>
        </div>
      )}
      {sparkline && sparkline.length > 0 && !compact && (
        <div className="mt-3 flex h-6 items-end gap-0.5">
          {sparkline.map((v, i) => {
            const max = Math.max(...sparkline);
            const h = Math.max(10, (v / max) * 100);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-[var(--accent-soft)]"
                style={{
                  height: `${h}%`,
                  opacity: 0.4 + (i / sparkline.length) * 0.6,
                }}
              />
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
