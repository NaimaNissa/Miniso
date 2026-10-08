"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { formatDuration, statusLabel, statusTone } from "@/lib/staff";
import { StaffError, StaffLoading, useStaffDesk } from "@/components/staff/desk";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarOff,
  Clock,
  Coffee,
  ListChecks,
  Users,
  Wallet,
} from "lucide-react";

export default function StaffTodayPage() {
  const { ready, me, view, error, clock, progress, taskCount, doneTasks } =
    useStaffDesk();

  if (!ready || !me || !view) return <StaffLoading />;

  const onFloor = view.teammates.filter(
    (person) => person.state === "in" || person.state === "break"
  ).length;

  const links = [
    {
      href: "/staff/schedule",
      icon: CalendarDays,
      label: "Schedule",
      value: view.schedule.find((day) => day.today)?.shift ?? me.shiftStart,
      hint: "This week",
    },
    {
      href: "/staff/tasks",
      icon: ListChecks,
      label: "Tasks",
      value: `${doneTasks.length}/${taskCount}`,
      hint: `${progress}% done`,
    },
    {
      href: "/staff/team",
      icon: Users,
      label: "My team",
      value: String(view.teammates.length),
      hint: `${onFloor} on the floor`,
    },
    {
      href: "/staff/payroll",
      icon: Wallet,
      label: "Payroll",
      value: formatCurrency(view.payslip.net),
      hint: `Payday ${view.payslip.payday}`,
    },
    {
      href: "/staff/leave",
      icon: CalendarOff,
      label: "Leave",
      value: `${view.casual.left} casual`,
      hint: `${view.sick.left} sick days left`,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Hi, ${me.name.split(" ")[0]}`}
        description={`${me.position} · ${me.employeeCode} · ${me.workspace}`}
        actions={<Pill tone={statusTone(view.state)}>{statusLabel(view.state)}</Pill>}
      />
      <StaffError error={error} />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <SurfaceCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Today’s shift
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                {me.shiftStart}
                <span className="text-[var(--text-muted)]">–</span>
                {me.shiftEnd}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {formatDuration(view.minutes)} on the clock
                {view.state === "off" ? " · Friday is your day off" : ""}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {(view.state === "scheduled" ||
              view.state === "done" ||
              view.state === "off") && (
              <Button onClick={() => clock("in")}>Clock in</Button>
            )}
            {view.state === "in" && (
              <>
                <Button variant="outline" onClick={() => clock("break_start")}>
                  <Coffee className="h-3.5 w-3.5" />
                  Start break
                </Button>
                <Button onClick={() => clock("out")}>Clock out</Button>
              </>
            )}
            {view.state === "break" && (
              <Button onClick={() => clock("break_end")}>End break</Button>
            )}
          </div>
          {view.needsBreak && (
            <p className="mt-5 rounded-[var(--radius-md)] bg-[var(--warning-soft)] px-3 py-2.5 text-sm text-[var(--warning)]">
              You’ve been on the floor for over 3 hours. Take your break — your
              manager already has you covered.
            </p>
          )}
        </SurfaceCard>

        <SurfaceCard className="flex flex-col p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{me.workspace}</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {me.city ? `${me.city} · ` : ""}
                Manager {me.managerName}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            {onFloor} teammate{onFloor === 1 ? "" : "s"} on the floor right now.
            Branch changes go through {me.managerName}.
          </p>
          <Link
            href="/staff/team"
            className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-[var(--accent)]"
          >
            See the team
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </SurfaceCard>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <SurfaceCard hover className="h-full p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-lg font-semibold tracking-tight">
                  {item.value}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.hint}</p>
              </SurfaceCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
