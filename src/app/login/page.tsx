"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { demoUsersByLane, getModulesForRole, roleMeta } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Eye, EyeOff, Lock, Mail, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  async function completeLogin(userEmail: string, userPassword: string) {
    setError("");
    setLoading(true);
    const result = await login(userEmail, userPassword);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setActiveDemo(null);
      return;
    }
    router.replace(result.home);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    completeLogin(email, password);
  }

  function demoLogin(userEmail: string, userPassword: string, userId: string) {
    setEmail(userEmail);
    setPassword(userPassword);
    setActiveDemo(userId);
    completeLogin(userEmail, userPassword);
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 85% 5%, rgba(228,59,59,0.12), transparent 28%), radial-gradient(circle at 10% 80%, rgba(228,59,59,0.06), transparent 35%), var(--background)",
        }}
      />

      <section className="flex flex-1 flex-col justify-center px-6 py-12 lg:max-w-xl lg:px-12 xl:px-16">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-sm font-bold text-white">
              M
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">MINISO</p>
              <p className="text-xs text-[var(--text-muted)]">Retail OS</p>
            </div>
          </div>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Demo login
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Pick any role below for one-click access, or enter credentials
            manually. Each user only sees their modules.
          </p>
        </div>

        <GlassCard className="w-full p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Manual sign in
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Email
              </label>
              <div className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3">
                <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder="owner@miniso.bd"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <div className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3">
                <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-[var(--text-muted)]"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-[var(--radius-sm)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            Got an HQ invite? Open the link in your email to join your role
            dashboard. Walk-up floor staff can still self-register.
          </p>
          <Link
            href="/staff/signup"
            className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-[var(--accent)]"
          >
            <UserPlus className="h-4 w-4" />
            Staff portal — create an employee account
          </Link>
        </GlassCard>
      </section>

      <section className="flex flex-1 flex-col border-t border-[var(--border)] px-6 py-10 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Kept for every role
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Demo accounts
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]" suppressHydrationWarning>
            HQ owns every branch. Each branch has its own manager, cashiers, and
            floor staff - same shared records.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          {demoUsersByLane().map((lane) => (
            <div key={lane.label}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {lane.label}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {lane.users.map((u) => {
                  const modules = getModulesForRole(u.role);
                  const meta = roleMeta[u.role];
                  const busy = loading && activeDemo === u.id;
                  return (
                    <SurfaceCard
                      key={u.id}
                      className="flex h-full flex-col p-4 transition-shadow hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                          {u.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[var(--text-primary)]">
                              {u.name}
                            </p>
                            <Pill tone="accent">{meta.shortLabel}</Pill>
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                            {u.title} · {u.workspace}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 rounded-[var(--radius-md)] bg-[var(--background-elevated)] px-3 py-2.5 font-mono text-[11px]">
                        <p className="text-[var(--text-secondary)]">
                          <span className="text-[var(--text-muted)]">email </span>
                          {u.email}
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          <span className="text-[var(--text-muted)]">pass </span>
                          {u.password}
                        </p>
                      </div>

                      <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                        {modules.length} modules · {meta.description}
                      </p>

                      <Button
                        type="button"
                        className="mt-3 w-full"
                        size="sm"
                        disabled={loading}
                        onClick={() => demoLogin(u.email, u.password, u.id)}
                      >
                        {busy ? "Signing in…" : "Demo login"}
                        {!busy && <ArrowRight className="h-3.5 w-3.5" />}
                      </Button>
                    </SurfaceCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
