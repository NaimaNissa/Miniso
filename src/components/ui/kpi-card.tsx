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
        "h-full animate-fade-in",
        compact ? "p-4" : "p-5",
        accent && "ring-1 ring-[var(--accent)]/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {label}
        </p>
        {Icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-3 font-semibold tracking-tight text-[var(--text-primary)]",
          compact ? "text-[1.35rem] sm:text-xl" : "text-2xl"
        )}
      >
        {display}
        {suffix && (
          <span className="ml-1 text-xs font-medium text-[var(--text-muted)] sm:text-sm">
            {suffix}
          </span>
        )}
      </p>
      {change !== undefined && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
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
      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 flex h-7 items-end gap-0.5">
          {sparkline.map((v, i) => {
            const max = Math.max(...sparkline, 1);
            const h = Math.max(12, (v / max) * 100);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-[var(--accent)]/25"
                style={{
                  height: `${h}%`,
                  opacity: 0.35 + (i / sparkline.length) * 0.65,
                }}
              />
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
