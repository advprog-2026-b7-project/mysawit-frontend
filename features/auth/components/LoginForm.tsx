"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthLayout from "./AuthLayout";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";
import GoogleButton from "./GoogleButton";
import OrDivider from "./OrDivider";
import RolePickerModal from "./RolePickerModal";
import authClient from "@/services/authClient";
import { setTokenCookie, getTokenCookie } from "@/services/tokenCookie";

type Role = "BURUH" | "MANDOR" | "SUPIR";

function extractToken(res: Record<string, unknown>): string | null {
  if (typeof res.token === "string" && res.token) return res.token;
  if (typeof res.accessToken === "string" && res.accessToken) return res.accessToken;
  if (typeof res.jwt === "string" && res.jwt) return res.jwt;
  if (res.data && typeof res.data === "object") {
    const d = res.data as Record<string, unknown>;
    if (typeof d.token === "string") return d.token;
  }
  return null;
}

async function redirectByRole() {
  try {
    const res = await authClient.get("/api/auth/me");
    const user = res.data?.data ?? res.data;
    const role: string = user?.role ?? "";
    window.location.href = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
  } catch {
    window.location.href = "/dashboard";
  }
}

function isRoleRequired(err: unknown): boolean {
  const e = err as { response?: { data?: { message?: string; errors?: unknown[] } } };
  const msg = (e?.response?.data?.message ?? "").toLowerCase();
  const errors = e?.response?.data?.errors ?? [];
  return (
    msg.includes("role is required") ||
    msg.includes("role_required") ||
    (Array.isArray(errors) &&
      errors.some(
        (er) =>
          typeof er === "string" &&
          (er.toLowerCase().includes("role is required") || er.toLowerCase().includes("role_required"))
      ))
  );
}

export default function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Google OAuth role picker state
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [modalLoading, setModalLoading]     = useState(false);

  // Route guard: already-logged-in users go to dashboard
  useEffect(() => {
    if (typeof window !== "undefined" && getTokenCookie()) {
      void redirectByRole();
    }
  }, []);

  const clearError = () => { if (error) setError(""); };

  /* ── Credential login ──────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authClient.post("/api/auth/login", { email, password });
      const token = extractToken(res.data as Record<string, unknown>);
      if (!token) throw new Error("No token in response.");
      setTokenCookie(token);
      await redirectByRole();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      // Single anti-enumeration message regardless of whether email or password was wrong
      const apiMsg = e?.response?.data?.message ?? "";
      const isAuthError =
        apiMsg === "INVALID_CREDENTIALS" ||
        apiMsg === "ACCOUNT_INACTIVE" ||
        (e as { response?: { status?: number } })?.response?.status === 401;
      setError(isAuthError || !apiMsg ? "Invalid credentials. Please try again." : apiMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Google OAuth ──────────────────────────────────────────── */
  const handleGoogleSuccess = async (credential: string) => {
    try {
      const res = await authClient.post("/api/auth/google-login", { idToken: credential });
      const token = extractToken(res.data as Record<string, unknown>);
      if (!token) throw new Error("No token in response.");
      setTokenCookie(token);
      await redirectByRole();
    } catch (err: unknown) {
      if (isRoleRequired(err)) {
        setPendingIdToken(credential);
      } else {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e?.response?.data?.message || "Google sign-in failed. Please try again.");
      }
    }
  };

  /* ── Role picker confirm (Google new-user flow) ────────────── */
  const handleRoleConfirm = async (role: Role, certNumber?: string) => {
    if (!pendingIdToken) return;
    setModalLoading(true);
    try {
      const body: Record<string, unknown> = { idToken: pendingIdToken, role };
      if (certNumber) body.mandorCertificationNumber = certNumber;
      const res = await authClient.post("/api/auth/google-login", body);
      const token = extractToken(res.data as Record<string, unknown>);
      if (!token) throw new Error("No token in response.");
      setTokenCookie(token);
      setPendingIdToken(null);
      await redirectByRole();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Registration failed. Please try again.");
      setPendingIdToken(null);
    } finally {
      setModalLoading(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <>
      <AuthLayout>
        <h1
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "29px",
            color: "#525252",
            margin: "0 0 28px",
            lineHeight: 1.25,
          }}
        >
          Sign in to Your Account
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Username"
            placeholder="Type here"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="Type here"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            error={error || undefined}
          />

          <div style={{ marginTop: "8px", marginBottom: "12px" }}>
            <PrimaryButton type="submit" label="Login" loading={loading} disabled={loading} />
          </div>
        </form>

        <OrDivider />

        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in failed.")}
        />

        <p
          style={{
            textAlign: "center",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "11.2px",
            color: "#525252",
            marginTop: "20px",
          }}
        >
          Are you new?{" "}
          <Link href="/register" style={{ color: "#BB7354", textDecoration: "none", fontWeight: 700 }}>
            Register Now
          </Link>
        </p>
      </AuthLayout>

      {pendingIdToken && (
        <RolePickerModal
          onConfirm={handleRoleConfirm}
          onCancel={() => setPendingIdToken(null)}
          loading={modalLoading}
        />
      )}
    </>
  );
}
