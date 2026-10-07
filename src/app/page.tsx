"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { roleMeta } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (user) {
      router.replace(roleMeta[user.role].home);
    } else {
      router.replace("/login");
    }
  }, [ready, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="h-8 w-40 skeleton" />
    </div>
  );
}
