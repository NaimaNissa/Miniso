import { cn } from "@/lib/utils";

export function DashboardFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-fade-in space-y-5 sm:space-y-6", className)}>
      {children}
    </div>
  );
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetaStrip({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/80 px-3.5 py-2.5 sm:px-4">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-baseline gap-1.5 text-xs">
          <span className="text-[var(--text-muted)]">{item.label}</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProgressRail({
  label,
  valueLabel,
  percent,
}: {
  label: string;
  valueLabel: string;
  percent: number;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-medium text-[var(--text-secondary)]">
          {valueLabel}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
