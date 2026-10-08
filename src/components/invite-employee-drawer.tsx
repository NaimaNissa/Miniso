"use client";

import { useMemo, useState } from "react";
import { SideDrawer } from "@/components/ui/side-drawer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useRetail } from "@/components/retail-provider";
import { api } from "@/lib/api";
import { STAFF_POSITIONS } from "@/lib/staff";
import { roleMeta, type RoleId } from "@/lib/auth";

const OWNER_ROLES: RoleId[] = [
  "inventory_manager",
  "warehouse_staff",
  "store_manager",
  "social_media",
  "staff",
];

type InviteResult = {
  inviteUrl: string;
  emailStatus: string;
  message: string;
};

export function InviteEmployeeDrawer({
  open,
  onClose,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
}) {
  const { user, token } = useAuth();
  const { stores, warehouses } = useRetail();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<RoleId>("staff");
  const [branchId, setBranchId] = useState(user?.branchId || stores[0]?.id || "");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "WH-BD-DHK-01");
  const [position, setPosition] = useState("Cashier");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);

  const roles = useMemo(() => {
    if (user?.role === "owner") return OWNER_ROLES;
    if (user?.role === "inventory_manager")
      return ["warehouse_staff", "staff"] as RoleId[];
    return ["staff", "social_media"] as RoleId[];
  }, [user?.role]);

  const needsBranch =
    role === "store_manager" || role === "social_media" || role === "staff";
  const needsWarehouse = role === "warehouse_staff";
  const needsPosition = role === "staff";

  async function submit() {
    if (!token) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const created = await api.createInvite(token, {
        email: email.trim(),
        role,
        name: name.trim(),
        position: needsPosition ? position : undefined,
        branchId: needsBranch
          ? user?.role === "store_manager"
            ? user.branchId || undefined
            : branchId
          : undefined,
        warehouseId: needsWarehouse ? warehouseId : undefined,
      });
      setResult({
        inviteUrl: created.inviteUrl,
        emailStatus: created.emailStatus,
        message: created.message,
      });
      onSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send invite");
    } finally {
      setBusy(false);
    }
  }

  function resetAndClose() {
    setEmail("");
    setName("");
    setError("");
    setResult(null);
    setCopied(false);
    onClose();
  }

  return (
    <SideDrawer
      open={open}
      onClose={resetAndClose}
      title="Invite employee"
      footer={
        result ? (
          <Button className="w-full" onClick={resetAndClose}>
            Done
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={busy || !email.trim()}
              onClick={() => void submit()}
            >
              {busy ? "Sending…" : "Send invite"}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-3 text-sm">
        {result ? (
          <>
            <p className="text-[var(--text-secondary)]">{result.message}</p>
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] p-3">
              <p className="text-xs text-[var(--text-muted)]">Invite link</p>
              <p className="mt-1 break-all text-xs font-medium">{result.inviteUrl}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.inviteUrl);
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Email status: {result.emailStatus}
              {result.emailStatus === "queued_local"
                ? " — set RESEND_API_KEY or SMTP_* on the API for live delivery"
                : ""}
            </p>
          </>
        ) : (
          <>
            <p className="text-[var(--text-secondary)]">
              Sends a role-based signup link to their email. When they accept,
              they land on the dashboard for that role.
            </p>
            {error && <p className="text-[var(--danger)]">{error}</p>}
            <label className="block text-xs text-[var(--text-muted)]">
              Work email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                placeholder="name@miniso.bd"
              />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Name (optional)
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Role
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleId)}
                className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
              >
                {roles.map((id) => (
                  <option key={id} value={id}>
                    {roleMeta[id].label}
                  </option>
                ))}
              </select>
            </label>
            {needsBranch && user?.role !== "store_manager" && (
              <label className="block text-xs text-[var(--text-muted)]">
                Branch
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {needsWarehouse && (
              <label className="block text-xs text-[var(--text-muted)]">
                Warehouse
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {needsPosition && (
              <label className="block text-xs text-[var(--text-muted)]">
                Position
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 text-sm"
                >
                  {STAFF_POSITIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
      </div>
    </SideDrawer>
  );
}
