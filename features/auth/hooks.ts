"use client";

import { useState } from "react";
import { loginApi, registerApi, googleLoginApi, logoutApi } from "./api";
import type { LoginRequest, RegisterRequest } from "./types";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      await loginApi(data);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : "Login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      await registerApi(data);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : "Registration failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      setLoading(false);
      window.location.href = "/login";
    }
  };

  return { logout, loading };
}

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      await googleLoginApi(idToken);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : "Google login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return { googleLogin, loading, error };
}
