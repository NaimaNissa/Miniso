"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { leaveDays, type LeaveKind } from "@/lib/staff";
import {
  fieldClass,
  Metric,
  StaffError,
  StaffLoading,
  useStaffDesk,
} from "@/components/staff/desk";

export default function StaffLeavePage() {
  const { ready, me, view, error, requestLeave } = useStaffDesk();
  const [leaveForm, setLeaveForm] = useState({
    kind: "casual" as LeaveKind,
    from: "",
    to: "",
    reason: "",
  });
  const [leaveError, setLeaveError] = useState("");

  if (!ready || !me || !view) return <StaffLoading />;

  const pending = view.mine.filter((leave) => leave.status === "pending").length;

  function submitLeave(e: React.FormEvent) {
    e.preventDefault();
    const result = requestLeave(leaveForm);
    if (!result.ok) {
      setLeaveError(result.error);
      return;
    }
    setLeaveError("");
    setLeaveForm({ kind: "casual", from: "", to: "", reason: "" });
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leave"
        description={`${me.managerName} approves requests for ${me.workspace}`}
      />
      <StaffError error={error} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Casual"
          value={`${view.casual.left} left`}
          hint={`${view.casual.used} used of ${view.casual.allowance}`}
        />
        <Metric
          label="Sick"
          value={`${view.sick.left} left`}
          hint={`${view.sick.used} used of ${view.sick.allowance}`}
        />
        <Metric label="Waiting" value={String(pending)} hint="Pending with your manager" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="p-5">
          <h2 className="text-sm font-semibold">Request time off</h2>
          <form onSubmit={submitLeave} className="mt-4 grid gap-3">
            <label>
              <span className="mb-1 block text-xs text-[var(--text-muted)]">Type</span>
              <select
                value={leaveForm.kind}
                onChange={(e) =>
                  setLeaveForm((current) => ({
                    ...current,
                    kind: e.target.value as LeaveKind,
                  }))
                }
                className={fieldClass}
              >
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs text-[var(--text-muted)]">From</span>
                <input
                  type="date"
                  required
                  value={leaveForm.from}
                  onChange={(e) =>
                    setLeaveForm((current) => ({ ...current, from: e.target.value }))
                  }
                  className={fieldClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs text-[var(--text-muted)]">To</span>
                <input
                  type="date"
                  required
                  value={leaveForm.to}
                  onChange={(e) =>
                    setLeaveForm((current) => ({ ...current, to: e.target.value }))
                  }
                  className={fieldClass}
                />
              </label>
            </div>
            <label>
              <span className="mb-1 block text-xs text-[var(--text-muted)]">
                Note for {me.managerName}
              </span>
              <input
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm((current) => ({ ...current, reason: e.target.value }))
                }
                placeholder="Reason"
                className={fieldClass}
              />
            </label>
            {leaveError && <p className="text-sm text-[var(--danger)]">{leaveError}</p>}
            <Button type="submit" className="justify-self-start">
              Request leave
            </Button>
          </form>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <h2 className="text-sm font-semibold">Your requests</h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {view.mine.length === 0 && (
              <li className="py-6 text-sm text-[var(--text-muted)]">No requests yet.</li>
            )}
            {view.mine.map((leave) => (
              <li key={leave.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {leave.kind} · {leaveDays(leave)} day{leaveDays(leave) === 1 ? "" : "s"}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {leave.from} → {leave.to}
                    {leave.reason ? ` · ${leave.reason}` : ""}
                  </p>
                </div>
                <Pill
                  tone={
                    leave.status === "approved"
                      ? "success"
                      : leave.status === "declined"
                        ? "danger"
                        : "warning"
                  }
                >
                  {leave.status}
                </Pill>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}
