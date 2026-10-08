"use client";

import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import type { LeaveKind, LeaveRequest, Punch, StaffMember } from "@/lib/staff";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type StaffContextValue = {
  ready: boolean;
  directory: StaffMember[];
  punches: Punch[];
  leaves: LeaveRequest[];
  me: StaffMember | null;
  error: string;
  clock: (type: Punch["type"]) => void;
  updateProfile: (patch: Partial<StaffMember>) => void;
  requestLeave: (input: {
    kind: LeaveKind;
    from: string;
    to: string;
    reason: string;
  }) => { ok: true } | { ok: false; error: string };
  reviewLeave: (id: string, status: "approved" | "declined") => void;
  toggleTask: (taskId: string) => void;
  doneTasks: string[];
};

const StaffContext = createContext<StaffContextValue | null>(null);
const TASK_KEY = "miniso-staff-tasks-v1";

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [ready, setReady] = useState(false);
  const [directory, setDirectory] = useState<StaffMember[]>([]);
  const [punches, setPunches] = useState<Punch[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState<Record<string, string[]>>({});

  const apply = useCallback(
    (bundle: { directory: StaffMember[]; punches: Punch[]; leaves: LeaveRequest[] }) => {
      setDirectory(bundle.directory);
      setPunches(bundle.punches);
      setLeaves(bundle.leaves);
    },
    []
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASK_KEY);
      if (raw) setTasks(JSON.parse(raw) as Record<string, string[]>);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!token || !user) {
      setDirectory([]);
      setPunches([]);
      setLeaves([]);
      setReady(true);
      return;
    }
    if (!["owner", "store_manager", "staff", "inventory_manager"].includes(user.role)) {
      setReady(true);
      return;
    }
    let cancelled = false;
    setReady(false);
    api
      .staff(token)
      .then((bundle) => {
        if (!cancelled) apply(bundle);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apply, token, user]);

  const me = useMemo(
    () => directory.find((person) => person.id === user?.id) ?? null,
    [directory, user?.id]
  );

  const clock = useCallback(
    (type: Punch["type"]) => {
      if (!token) return;
      api.clock(token, type).then(apply).catch((err: Error) => setError(err.message));
    },
    [apply, token]
  );

  const updateProfile = useCallback(
    (patch: Partial<StaffMember>) => {
      if (!token) return;
      api
        .updateProfile(token, {
          phone: patch.phone ?? me?.phone ?? "",
          address: patch.address ?? me?.address ?? "",
          bankAccount: patch.bankAccount ?? me?.bankAccount ?? "",
          emergencyName: patch.emergencyName ?? me?.emergencyName ?? "",
          emergencyPhone: patch.emergencyPhone ?? me?.emergencyPhone ?? "",
        })
        .then(apply)
        .catch((err: Error) => setError(err.message));
    },
    [apply, me, token]
  );

  const requestLeave = useCallback(
    (input: { kind: LeaveKind; from: string; to: string; reason: string }) => {
      if (!token) return { ok: false as const, error: "Sign in as staff first." };
      if (!input.from || !input.to || input.to < input.from) {
        return { ok: false as const, error: "Choose a valid date range." };
      }
      if (!input.reason.trim()) {
        return { ok: false as const, error: "Add a short reason for your manager." };
      }
      api
        .requestLeave(token, input)
        .then(apply)
        .catch((err: Error) => setError(err.message));
      return { ok: true as const };
    },
    [apply, token]
  );

  const reviewLeave = useCallback(
    (id: string, status: "approved" | "declined") => {
      if (!token) return;
      api.reviewLeave(token, id, status).then(apply).catch((err: Error) => setError(err.message));
    },
    [apply, token]
  );

  const doneTasks = useMemo(() => {
    if (!me) return [];
    const today = new Date().toISOString().slice(0, 10);
    return tasks[`${me.id}:${today}`] ?? [];
  }, [me, tasks]);

  const toggleTask = useCallback(
    (taskId: string) => {
      if (!me) return;
      const today = new Date().toISOString().slice(0, 10);
      const key = `${me.id}:${today}`;
      const current = tasks[key] ?? [];
      const nextIds = current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId];
      const next = { ...tasks, [key]: nextIds };
      setTasks(next);
      try {
        localStorage.setItem(TASK_KEY, JSON.stringify(next));
      } catch {
        // checklist ticks stay local; attendance and payroll stay on the server
      }
    },
    [me, tasks]
  );

  const value = useMemo(
    () => ({
      ready,
      directory,
      punches,
      leaves,
      me,
      error,
      clock,
      updateProfile,
      requestLeave,
      reviewLeave,
      toggleTask,
      doneTasks,
    }),
    [
      ready,
      directory,
      punches,
      leaves,
      me,
      error,
      clock,
      updateProfile,
      requestLeave,
      reviewLeave,
      toggleTask,
      doneTasks,
    ]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
}
