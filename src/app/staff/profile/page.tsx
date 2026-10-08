"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/staff");
  }, [router]);
  return <div className="h-40 skeleton rounded-[var(--radius-lg)]" />;
}
