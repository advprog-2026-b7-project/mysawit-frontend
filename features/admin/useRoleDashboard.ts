"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, type MeResponse, type Role } from "./api";
import { getTokenCookie } from "@/services/tokenCookie";
import { dashboardPathForRole } from "./routing";

export function useRoleDashboard(expectedRole: Role) {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getTokenCookie();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    async function loadUser() {
      try {
        const me = await getMe();
        if (me.role !== expectedRole) {
          router.push(dashboardPathForRole(me.role));
          return;
        }
        setUser(me);
      } catch {
        // Network error or expired token — redirect to login but don't wipe the token
        // in case it's just a transient failure.
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [expectedRole, router]);

  return { user, loading };
}
