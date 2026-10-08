"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { STAFF_POSITIONS } from "@/lib/staff";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, Lock, Mail, MapPin, Phone, User } from "lucide-react";

export default function StaffSignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    position: "Cashier",
    branchId: "",
    emergencyName: "",
    emergencyPhone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.stores().then((rows) => {
      setStores(rows);
      setForm((current) => ({
        ...current,
        branchId: current.branchId || rows[0]?.id || "",
      }));
    }).catch((err: Error) => setError(err.message));
  }, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const created = await signup(form);
    setLoading(false);
    if (!created.ok) {
      setError(created.error);
      return;
    }
    router.replace(created.home);
  }

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 85% 5%, rgba(228,59,59,0.12), transparent 28%), var(--background)",
        }}
      />
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-sm font-bold text-white">
            M
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Staff portal</p>
            <p className="text-xs text-[var(--text-muted)]">
              Join your branch. Your manager will see you on their team.
            </p>
          </div>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" icon={User}>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="Your name"
              />
            </Field>
            <Field label="Work email" icon={Mail}>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="you@miniso.bd"
                autoComplete="username"
              />
            </Field>
            <Field label="Password" icon={Lock}>
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Branch
                </span>
                <select
                  value={form.branchId}
                  onChange={(e) => set("branchId", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Position
                </span>
                <select
                  value={form.position}
                  onChange={(e) => set("position", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none"
                >
                  {STAFF_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Field label="Phone" icon={Phone}>
              <input
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <Field label="Address" icon={MapPin}>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="Area, city"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Emergency contact
                </span>
                <input
                  value={form.emergencyName}
                  onChange={(e) => set("emergencyName", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none"
                  placeholder="Name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Emergency phone
                </span>
                <input
                  value={form.emergencyPhone}
                  onChange={(e) => set("emergencyPhone", e.target.value)}
                  className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none"
                  placeholder="01XXXXXXXXX"
                />
              </label>
            </div>

            {error && (
              <p className="rounded-[var(--radius-sm)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating account…" : "Create staff account"}
            </Button>
            <p className="text-center text-xs text-[var(--text-muted)]">
              Your branch manager handles attendance, leave, and payroll for
              this store. Owners can see every branch.
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <div className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3">
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
        {children}
      </div>
    </label>
  );
}
