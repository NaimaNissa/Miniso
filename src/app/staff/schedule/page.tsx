"use client";

import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { formatDuration, shiftMinutes } from "@/lib/staff";
import { Metric, StaffError, StaffLoading, useStaffDesk } from "@/components/staff/desk";

export default function StaffSchedulePage() {
  const { ready, me, view, error } = useStaffDesk();
  if (!ready || !me || !view) return <StaffLoading />;

  const workDays = view.schedule.filter((day) => !day.off).length;
  const off = view.schedule.find((day) => day.off);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Schedule"
        description={`${me.workspace} · shifts set by ${me.managerName}`}
      />
      <StaffError error={error} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Shift" value={`${me.shiftStart}–${me.shiftEnd}`} hint="Same window every working day" />
        <Metric
          label="Length"
          value={formatDuration(shiftMinutes(me))}
          hint={`${workDays} working days this week`}
        />
        <Metric label="Day off" value={off?.label ?? "—"} hint="Recurring each week" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {view.schedule.map((day) => (
          <SurfaceCard
            key={day.key}
            className={`p-4 ${
              day.today ? "ring-1 ring-[var(--accent)]" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm ${day.today ? "font-semibold" : "text-[var(--text-secondary)]"}`}>
                {day.label}
              </p>
              {day.today && (
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                  Today
                </span>
              )}
            </div>
            <p
              className={`mt-6 text-lg font-semibold tracking-tight ${
                day.off ? "text-[var(--text-muted)]" : ""
              }`}
            >
              {day.off ? "Off" : me.shiftStart}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {day.off ? "Rest day" : `Until ${me.shiftEnd}`}
            </p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
