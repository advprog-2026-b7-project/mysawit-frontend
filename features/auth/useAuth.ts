"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getTokenCookie, deleteTokenCookie } from "@/services/tokenCookie";

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
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const loadCurrentUser = async () => {
    const token = getTokenCookie();

    if (!token) {
      setLoading(false);
      return;
    }

    const url = `${baseURL}/api/auth/me`;

    try {
      const response = await axios.get<AuthUser>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = response.data as AuthUser | { data?: AuthUser };
      setUser("data" in payload && payload.data ? payload.data : (payload as AuthUser));
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        deleteTokenCookie();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  const logout = async () => {
    const token = getTokenCookie() ?? "";
    try {
      await axios.post(
        `${baseURL}/api/auth/logout`,
        { token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // ignore
    } finally {
      deleteTokenCookie();
      window.location.href = "/auth/login";
    }
  };

  return { user, loading, logout };
}
