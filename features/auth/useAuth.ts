"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface AuthUser {
  id: string;
  username: string;
  email?: string;
  authProvider?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const loadCurrentUser = async () => {
    const token = localStorage.getItem("token");

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

      setUser(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${baseURL}/api/auth/logout`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {
      console.warn("Backend logout failed, clearing token locally.");
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
};

  return { user, loading, logout };
}
