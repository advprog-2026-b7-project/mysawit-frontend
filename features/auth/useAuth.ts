"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("useAuth: token in localStorage =", token ? token.substring(0, 20) + "..." : null);

    if (!token) {
      setLoading(false);
      return;
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const url = `${baseURL}/api/auth/me`;

    console.log("useAuth: fetching", url);
    console.log("useAuth: Authorization header =", `Bearer ${token.substring(0, 20)}...`);

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("useAuth: /auth/me success", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.error("useAuth: /auth/me failed", err?.response?.status, err?.response?.data, err?.message);
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return { user, loading, logout };
}
