"use client";

import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { dailyTasks } from "@/lib/staff";
import { Metric, StaffError, StaffLoading, useStaffDesk } from "@/components/staff/desk";
import { Check } from "lucide-react";

export default function StaffTasksPage() {
  const { ready, me, error, toggleTask, doneTasks, progress, taskCount } =
    useStaffDesk();
  if (!ready || !me) return <StaffLoading />;

  const left = taskCount - doneTasks.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tasks"
        description={`${me.workspace} · floor checklist for today`}
      />
      <StaffError error={error} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Done" value={`${progress}%`} hint={`${doneTasks.length} of ${taskCount}`} />
        <Metric label="Still open" value={String(left)} hint="Tick them off as you go" />
        <Metric label="Shift" value={`${me.shiftStart}–${me.shiftEnd}`} hint={me.position} />
      </div>

      <SurfaceCard className="p-2 sm:p-3">
        <ul>
          {dailyTasks.map((task, index) => {
            const done = doneTasks.includes(task.id);
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="flex w-full items-center gap-4 rounded-[var(--radius-md)] px-3 py-3.5 text-left hover:bg-[var(--background-elevated)]"
                >
                  <span className="w-6 text-xs font-medium text-[var(--text-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      done
                        ? "border-[var(--success)] bg-[var(--success)] text-white"
                        : "border-[var(--border-strong)]"
                    }`}
                  >
                    {done && <Check className="h-3 w-3" />}
                  </span>
                  <span
                    className={`text-sm ${
                      done
                        ? "text-[var(--text-muted)] line-through"
                        : "font-medium text-[var(--text-primary)]"
                    }`}
                  >
                    {task.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </SurfaceCard>
    </div>
  );
}
