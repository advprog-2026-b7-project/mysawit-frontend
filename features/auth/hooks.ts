import { useState } from "react";
import { loginApi, registerApi } from "./api";
import type { LoginRequest, RegisterRequest } from "./types";

/**
 * Extract the JWT token from the login/register response.
 * Handles multiple backend response shapes:
 *   { token: "..." }
 *   { accessToken: "..." }
 *   { data: { token: "..." } }
 */
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

      console.log("LOGIN RESPONSE:", JSON.stringify(res));

      const token = extractToken(res as Record<string, unknown>);

      if (!token) {
        throw new Error(
          "No token found in server response. Check backend response format."
        );
      }

      localStorage.setItem("token", token);

      // Verify the token was actually persisted
      const stored = localStorage.getItem("token");
      console.log("STORED TOKEN:", stored ? stored.substring(0, 20) + "..." : null);

      if (!stored) {
        throw new Error("Failed to persist token in localStorage.");
      }

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
        localStorage.setItem("token", token);
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