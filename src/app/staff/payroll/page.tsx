"use client";

import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { formatCurrency } from "@/lib/utils";
import { Metric, StaffError, StaffLoading, useStaffDesk } from "@/components/staff/desk";

export default function StaffPayrollPage() {
  const { ready, me, view, error } = useStaffDesk();
  if (!ready || !me || !view) return <StaffLoading />;

  const slip = view.payslip;
  const rows = [
    { label: "Basic", value: formatCurrency(slip.basic) },
    { label: "Attendance allowance", value: formatCurrency(slip.allowance) },
    { label: "Overtime", value: formatCurrency(slip.overtimePay) },
    { label: "Tax", value: `− ${formatCurrency(slip.tax)}` },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Payroll"
        description={`${me.employeeCode} · estimate until ${me.managerName} closes the month`}
      />
      <StaffError error={error} />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Estimated net
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            {formatCurrency(slip.net)}
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Payday {slip.payday}
          </p>
          <p className="mt-6 text-xs leading-relaxed text-[var(--text-muted)]">
            Salary and the bank account on file are managed by {me.managerName}.
            This figure follows hours clocked at {me.workspace}.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="text-sm font-semibold">This month</h2>
          <dl className="mt-4 divide-y divide-[var(--border)]">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-[var(--text-secondary)]">{row.label}</dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 text-sm">
              <dt className="font-semibold">Net</dt>
              <dd className="font-semibold">{formatCurrency(slip.net)}</dd>
            </div>
          </dl>
        </SurfaceCard>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Worked"
          value={`${slip.hours.toFixed(1)}h`}
          hint={`${slip.scheduledHours.toFixed(0)}h scheduled`}
        />
        <Metric
          label="Overtime"
          value={`${slip.overtimeHours.toFixed(1)}h`}
          hint="Paid at 1.5× after scheduled hours"
        />
        <Metric
          label="Absent"
          value={`${slip.absentDays} day${slip.absentDays === 1 ? "" : "s"}`}
          hint={slip.allowance > 0 ? "Allowance still applies" : "Allowance paused this month"}
        />
      </div>
    </div>
  );
}
