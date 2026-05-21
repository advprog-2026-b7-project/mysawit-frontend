import { useState } from "react";
import { loginApi, registerApi, googleLoginApi, logoutApi } from "./api";
import { setTokenCookie, deleteTokenCookie } from "@/services/tokenCookie";
import type { LoginRequest, RegisterRequest } from "./types";

function extractToken(res: Record<string, unknown>): string | null {
  if (typeof res.token === "string" && res.token) return res.token;
  if (typeof res.accessToken === "string" && res.accessToken) return res.accessToken;
  if (typeof res.jwt === "string" && res.jwt) return res.jwt;
  if (
    res.data &&
    typeof res.data === "object" &&
    "token" in res.data &&
    typeof (res.data as Record<string, unknown>).token === "string"
  ) {
    return (res.data as Record<string, unknown>).token as string;
  }
  return null;
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await loginApi(data);
      const token = extractToken(res as Record<string, unknown>);

      if (!token) {
        throw new Error("No token found in server response.");
      }

      setTokenCookie(token);
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
      const res = await registerApi(data);
      const token = extractToken(res as Record<string, unknown>);
      if (token) {
        setTokenCookie(token);
      }
      window.location.href = "/auth/login";
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
      deleteTokenCookie();
      setLoading(false);
      window.location.href = "/auth/login";
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
      const res = await googleLoginApi(idToken);
      const token = extractToken(res as Record<string, unknown>);

      if (!token) {
        throw new Error("No token found in server response.");
      }

      setTokenCookie(token);
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
