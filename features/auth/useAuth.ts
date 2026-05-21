"use client";

import { useEffect, useState } from "react";
import authClient from "@/services/authClient";

interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role?: string;
  mandorCertificationNumber?: string;
  mandorId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = async () => {
    try {
      const response = await authClient.get<AuthUser>("/api/auth/me");
      const payload = response.data as AuthUser | { data?: AuthUser };
      setUser("data" in payload && payload.data ? payload.data : (payload as AuthUser));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await authClient.post("/api/auth/logout", {});
    } catch {
      // ignore
    } finally {
      window.location.href = "/login";
    }
  };

  return { user, loading, logout };
}
