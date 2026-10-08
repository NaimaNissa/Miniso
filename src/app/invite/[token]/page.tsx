"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { ArrowLeft, Lock, Mail, User } from "lucide-react";

type InvitePreview = {
  email: string;
  role: string;
  roleLabel: string;
  title: string;
  name: string;
  workspace: string;
  invitedBy: string;
  home: string;
  expiresAt: string;
};

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const { acceptInvite } = useAuth();
  const router = useRouter();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoadingInvite(true);
    api
      .getInvite(token)
      .then((data) => {
        setInvite(data);
        setName(data.name || "");
        setError("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingInvite(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    const result = await acceptInvite({
      token,
      name: name.trim(),
      password,
      phone: phone.trim(),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(result.home);
  }

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 15% 10%, rgba(228,59,59,0.14), transparent 32%), linear-gradient(180deg, #faf7f4 0%, #f3ece6 100%)",
        }}
      />
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-sm font-bold text-white">
            M
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">
              Accept your invitation
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Set a password and open your role dashboard
            </p>
          </div>
        </div>

        <GlassCard className="p-6">
          {loadingInvite ? (
            <div className="h-40 skeleton rounded-[var(--radius-md)]" />
          ) : !invite ? (
            <div className="space-y-3">
              <p className="font-semibold">Invitation unavailable</p>
              <p className="text-sm text-[var(--text-secondary)]">{error}</p>
              <Link href="/login">
                <Button className="mt-2">Go to sign in</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="accent">{invite.roleLabel}</Pill>
                  <Pill tone="neutral">{invite.workspace}</Pill>
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Invited by <span className="font-medium">{invite.invitedBy}</span>
                  {" · "}expires {invite.expiresAt}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  {invite.email}
                </p>
              </div>

              {error && (
                <p className="rounded-[var(--radius-sm)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                  {error}
                </p>
              )}

              <label className="block text-xs text-[var(--text-muted)]">
                Full name
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-sm"
                  />
                </div>
              </label>

              <label className="block text-xs text-[var(--text-muted)]">
                Create password
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-sm"
                    placeholder="At least 6 characters"
                  />
                </div>
              </label>

              <label className="block text-xs text-[var(--text-muted)]">
                Phone (optional)
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                />
              </label>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading
                  ? "Creating account…"
                  : `Join as ${invite.roleLabel}`}
              </Button>
              <p className="text-center text-xs text-[var(--text-muted)]">
                After signup you go straight to {invite.home}
              </p>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
