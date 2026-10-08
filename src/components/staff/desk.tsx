"use client";

import { useRetail } from "@/components/retail-provider";
import { useStaff } from "@/components/staff-provider";
import {
  attendanceOf,
  dailyTasks,
  leaveBalance,
  payslipFor,
  weekSchedule,
  workedMinutes,
  type AttendanceState,
  type LeaveRequest,
  type Payslip,
  type StaffMember,
} from "@/lib/staff";

export function useStaffDesk() {
  const { notesByBranch } = useRetail();
  const staff = useStaff();
  const { me, punches, leaves, directory, doneTasks } = staff;
  const now = new Date();

  const view = !me
    ? null
    : (() => {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const state = attendanceOf(punches, me, now);
        const minutes = workedMinutes(punches, me.id, start, now);
        return {
          state,
          minutes,
          teammates: directory
            .filter((person) => person.branchId === me.branchId && person.id !== me.id)
            .map((person) => ({
              person,
              state: attendanceOf(punches, person, now) as AttendanceState,
            })),
          payslip: payslipFor(me, punches, now),
          schedule: weekSchedule(me, now),
          casual: leaveBalance(leaves, me.id, "casual"),
          sick: leaveBalance(leaves, me.id, "sick"),
          mine: leaves.filter((leave) => leave.staffId === me.id),
          notes: notesByBranch[me.branchId] ?? [],
          needsBreak:
            state === "in" &&
            minutes >= 180 &&
            !punches.some(
              (punch) =>
                punch.staffId === me.id &&
                punch.type === "break_start" &&
                new Date(punch.at).toDateString() === now.toDateString()
            ),
        };
      })();

  return {
    ...staff,
    view,
    progress: Math.round((doneTasks.length / dailyTasks.length) * 100),
    taskCount: dailyTasks.length,
  };
}

export type StaffDesk = NonNullable<ReturnType<typeof useStaffDesk>["view"]>;

export function StaffLoading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-56 skeleton" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-40 skeleton rounded-[var(--radius-lg)] lg:col-span-2" />
        <div className="h-40 skeleton rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}

export function StaffError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
      {error}
    </p>
  );
}

export const fieldClass =
  "h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]";

export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

export type { AttendanceState, LeaveRequest, Payslip, StaffMember };
