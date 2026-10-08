"use client";

import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { statusLabel, statusTone } from "@/lib/staff";
import { Metric, StaffError, StaffLoading, useStaffDesk } from "@/components/staff/desk";

export default function StaffTeamPage() {
  const { ready, me, view, error } = useStaffDesk();
  if (!ready || !me || !view) return <StaffLoading />;

  const onFloor = view.teammates.filter(
    (person) => person.state === "in" || person.state === "break"
  ).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My team"
        description={`${me.workspace} · managed by ${me.managerName}`}
      />
      <StaffError error={error} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Branch" value={me.workspace} hint={me.city || "Your store"} />
        <Metric label="Manager" value={me.managerName} hint="Approves leave and branch changes" />
        <Metric
          label="On the floor"
          value={`${onFloor}/${view.teammates.length}`}
          hint="Teammates currently in"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {view.teammates.map(({ person, state }) => (
          <SurfaceCard key={person.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                  {person.initials}
                </div>
                <div>
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{person.position}</p>
                </div>
              </div>
              <Pill tone={statusTone(state)}>{statusLabel(state)}</Pill>
            </div>
            <p className="mt-4 text-xs text-[var(--text-secondary)]">
              {person.shiftStart}–{person.shiftEnd} · {person.employeeCode}
            </p>
          </SurfaceCard>
        ))}
      </div>

      {view.notes.length > 0 && (
        <SurfaceCard className="mt-4 p-5">
          <h2 className="text-sm font-semibold">From the branch</h2>
          <ul className="mt-3 space-y-2">
            {view.notes.map((note) => (
              <li
                key={note}
                className="rounded-[var(--radius-md)] bg-[var(--background-elevated)] px-3 py-2.5 text-sm text-[var(--text-secondary)]"
              >
                {note}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      )}
    </div>
  );
}
