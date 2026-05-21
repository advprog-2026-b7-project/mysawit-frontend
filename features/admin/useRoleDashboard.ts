"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, type MeResponse, type Role } from "./api";
import { dashboardPathForRole } from "./routing";

export function useRoleDashboard(expectedRole: Role) {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe();
        if (me.role !== expectedRole) {
          router.push(dashboardPathForRole(me.role));
          return;
        }
        setUser(me);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [expectedRole, router]);

  return { user, loading };
}
