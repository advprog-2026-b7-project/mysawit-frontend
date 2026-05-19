"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/features/admin/api";
import { dashboardPathForRole } from "@/features/admin/routing";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function redirectToRoleDashboard() {
      try {
        const me = await getMe();
        router.replace(dashboardPathForRole(me.role));
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    }

    void redirectToRoleDashboard();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-[16px] text-[var(--color-text-body)]">
      Loading dashboard...
    </div>
  );
}
