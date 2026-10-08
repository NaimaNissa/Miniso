"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useStaff } from "@/components/staff-provider";
import { useRetail } from "@/components/retail-provider";
import { InviteEmployeeDrawer } from "@/components/invite-employee-drawer";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  attendanceOf,
  formatDuration,
  leaveDays,
  payslipFor,
  statusLabel,
  statusTone,
  workedMinutes,
  type StaffMember,
} from "@/lib/staff";

type InviteRow = {
  id: string;
  email: string;
  role: string;
  roleLabel: string;
  name: string;
  status: string;
  emailStatus: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  branchId: string;
};

export default function WorkforcePage() {
  const { user, token } = useAuth();
  const { stores, org } = useRetail();
  const { ready, directory, punches, leaves, reviewLeave } = useStaff();
  const isOwner = user?.role === "owner";
  const canInvite =
    user?.role === "owner" ||
    user?.role === "inventory_manager" ||
    user?.role === "store_manager";
  const [tab, setTab] = useState(isOwner ? "managers" : "team");
  const [branchId, setBranchId] = useState(user?.branchId ?? "all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [inviteBusy, setInviteBusy] = useState("");

  const loadInvites = useCallback(async () => {
    if (!token || !canInvite) return;
    try {
      const rows = await api.listInvites(token);
      setInvites(rows);
    } catch {
      setInvites([]);
    }
  }, [token, canInvite]);

  useEffect(() => {
    void loadInvites();
  }, [loadInvites]);

  const scopedBranch = isOwner ? branchId : user?.branchId ?? "";

  const team = useMemo(() => {
    return directory.filter((person) =>
      scopedBranch === "all" || scopedBranch === ""
        ? isOwner
        : person.branchId === scopedBranch
    );
  }, [directory, isOwner, scopedBranch]);

  const now = new Date();
  const rows = team.map((person) => {
    const state = attendanceOf(punches, person, now);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return {
      person,
      state,
      today: formatDuration(workedMinutes(punches, person.id, start, now)),
      payslip: payslipFor(person, punches, now),
    };
  });

  const present = rows.filter((row) => row.state === "in" || row.state === "break").length;
  const pending = leaves.filter(
    (leave) =>
      leave.status === "pending" &&
      team.some((person) => person.id === leave.staffId)
  );
  const selected = rows.find((row) => row.person.id === selectedId) ?? null;

  if (!ready) {
    return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;
  }

  const managerCards = stores.map((store) => {
    const people = directory.filter((person) => person.branchId === store.id);
    const onShift = people.filter((person) => {
      const state = attendanceOf(punches, person, now);
      return state === "in" || state === "break";
    }).length;
    return { store, people, onShift };
  });

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title={isOwner ? "People" : "My team"}
        description={
          isOwner
            ? `${org?.hq.name ?? "Bangladesh HQ"} · invite people by role and email — they land on the right dashboard.`
            : `${user?.workspace ?? "Your branch"} · you handle this store’s employees.`
        }
        actions={
          canInvite ? (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              Invite employee
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "On shift", value: String(present) },
          { label: "Team", value: String(rows.length) },
          { label: "Leave waiting", value: String(pending.length) },
          {
            label: "Payroll net",
            value: formatCurrency(rows.reduce((sum, row) => sum + row.payslip.net, 0)),
          },
        ].map((item) => (
          <SurfaceCard key={item.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold">{item.value}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={
            isOwner
              ? [
                  { id: "managers", label: "Managers" },
                  { id: "team", label: "Staff", count: rows.length },
                  {
                    id: "invites",
                    label: "Invites",
                    count: invites.filter((i) => i.status === "pending").length,
                  },
                  { id: "leave", label: "Leave", count: pending.length },
                  { id: "payroll", label: "Payroll" },
                ]
              : [
                  { id: "team", label: "Staff", count: rows.length },
                  ...(canInvite
                    ? [
                        {
                          id: "invites",
                          label: "Invites",
                          count: invites.filter((i) => i.status === "pending")
                            .length,
                        },
                      ]
                    : []),
                  { id: "leave", label: "Leave", count: pending.length },
                  { id: "payroll", label: "Payroll" },
                ]
          }
        />
        {isOwner && (
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="h-9 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
          >
            <option value="all">All branches</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {tab === "managers" && isOwner && (
        <div className="space-y-4">
          {org?.hq && (
            <SurfaceCard className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Headquarters
              </p>
              <p className="mt-1 text-lg font-semibold">{org.hq.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Owner {org.hq.ownerName || "—"} · {org.hq.city}, {org.hq.country}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {org.branches.length} branches report into this HQ
              </p>
            </SurfaceCard>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {managerCards.map(({ store, people, onShift }) => (
              <SurfaceCard key={store.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{store.manager}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Branch manager · {store.name}
                    </p>
                  </div>
                  <Pill
                    tone={store.status === "operational" ? "success" : "warning"}
                  >
                    {store.status}
                  </Pill>
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  {people.length} employees · {onShift} on shift now
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {store.managerEmail || "—"} · {store.city} · {store.id}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {people.slice(0, 4).map((person) => (
                    <Pill key={person.id} tone="neutral">
                      {person.name.split(" ")[0]} · {person.position}
                    </Pill>
                  ))}
                  {people.length > 4 && (
                    <Pill tone="neutral">+{people.length - 4}</Pill>
                  )}
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      )}

      {tab === "team" && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <SurfaceCard className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-3 py-3 font-medium">Branch</th>
                  <th className="px-3 py-3 font-medium">Today</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.person.id}
                    onClick={() => setSelectedId(row.person.id)}
                    className="cursor-pointer border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.person.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {row.person.position} · {row.person.shiftStart}–
                        {row.person.shiftEnd}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-[var(--text-secondary)]">
                      {row.person.workspace}
                    </td>
                    <td className="px-3 py-3 text-[var(--text-secondary)]">
                      {row.today}
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={statusTone(row.state)}>
                        {statusLabel(row.state)}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SurfaceCard>
          <StaffDetail person={selected?.person ?? rows[0]?.person ?? null} />
        </div>
      )}

      {tab === "leave" && (
        <SurfaceCard className="divide-y divide-[var(--border)]">
          {leaves.filter((leave) =>
            team.some((person) => person.id === leave.staffId)
          ).length === 0 && (
            <p className="p-5 text-sm text-[var(--text-muted)]">
              No leave requests for this team.
            </p>
          )}
          {leaves
            .filter((leave) => team.some((person) => person.id === leave.staffId))
            .map((leave) => {
              const person = directory.find((item) => item.id === leave.staffId);
              return (
                <div
                  key={leave.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {person?.name} · {leave.kind} · {leaveDays(leave)} day
                      {leaveDays(leave) === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {leave.from} → {leave.to} · {leave.reason}
                    </p>
                  </div>
                  {leave.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reviewLeave(leave.id, "declined")}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => reviewLeave(leave.id, "approved")}
                      >
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <Pill
                      tone={leave.status === "approved" ? "success" : "danger"}
                    >
                      {leave.status}
                    </Pill>
                  )}
                </div>
              );
            })}
        </SurfaceCard>
      )}

      {tab === "invites" && canInvite && (
        <SurfaceCard className="overflow-hidden">
          {invites.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-semibold">No invites yet</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Send a role-based signup link to someone&apos;s email.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setInviteOpen(true)}
              >
                Invite employee
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Invite</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr
                    key={invite.id}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {invite.name || "—"} · by {invite.invitedBy} ·{" "}
                        {invite.createdAt}
                      </p>
                    </td>
                    <td className="px-3 py-3">{invite.roleLabel}</td>
                    <td className="px-3 py-3">
                      <Pill
                        tone={
                          invite.status === "pending"
                            ? "warning"
                            : invite.status === "accepted"
                              ? "success"
                              : "neutral"
                        }
                      >
                        {invite.status}
                      </Pill>
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--text-muted)]">
                      {invite.emailStatus}
                    </td>
                    <td className="px-4 py-3">
                      {invite.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={inviteBusy === invite.id}
                            onClick={() => {
                              if (!token) return;
                              setInviteBusy(invite.id);
                              void api
                                .resendInvite(token, invite.id)
                                .then(() => loadInvites())
                                .finally(() => setInviteBusy(""));
                            }}
                          >
                            Resend
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={inviteBusy === invite.id}
                            onClick={() => {
                              if (!token) return;
                              setInviteBusy(invite.id);
                              void api
                                .revokeInvite(token, invite.id)
                                .then(() => loadInvites())
                                .finally(() => setInviteBusy(""));
                            }}
                          >
                            Revoke
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">
                          Expires {invite.expiresAt}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SurfaceCard>
      )}

      {tab === "payroll" && (
        <SurfaceCard className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-3 py-3 font-medium">Hours</th>
                <th className="px-3 py-3 font-medium">Basic</th>
                <th className="px-3 py-3 font-medium">Net</th>
                <th className="px-4 py-3 font-medium">Payday</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.person.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.person.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {row.person.workspace}
                    </p>
                  </td>
                  <td className="px-3 py-3">{row.payslip.hours.toFixed(1)}h</td>
                  <td className="px-3 py-3">
                    {formatCurrency(row.payslip.basic)}
                  </td>
                  <td className="px-3 py-3 font-medium">
                    {formatCurrency(row.payslip.net)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {row.payslip.payday}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SurfaceCard>
      )}

      <InviteEmployeeDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSent={() => void loadInvites()}
      />
    </div>
  );
}

function StaffDetail({ person }: { person: StaffMember | null }) {
  if (!person) {
    return (
      <SurfaceCard className="p-5 text-sm text-[var(--text-muted)]">
        Select an employee.
      </SurfaceCard>
    );
  }
  return (
    <SurfaceCard className="p-5">
      <p className="text-xs text-[var(--text-muted)]">{person.employeeCode}</p>
      <h2 className="mt-1 text-lg font-semibold">{person.name}</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        {person.position} · reports to {person.managerName}
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <Detail label="Branch" value={person.workspace} />
        <Detail label="Phone" value={person.phone || "—"} />
        <Detail label="Address" value={person.address || "—"} />
        <Detail label="Joined" value={person.joined} />
        <Detail label="Bank" value={person.bankAccount} />
        <Detail
          label="Emergency"
          value={
            person.emergencyName
              ? `${person.emergencyName} · ${person.emergencyPhone}`
              : "—"
          }
        />
      </dl>
    </SurfaceCard>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
