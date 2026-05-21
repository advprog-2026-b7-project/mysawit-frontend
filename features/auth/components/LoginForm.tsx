"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "./AuthLayout";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";
import GoogleButton from "./GoogleButton";
import OrDivider from "./OrDivider";
import RolePickerModal from "./RolePickerModal";
import authClient from "@/services/authClient";

type Role = "BURUH" | "MANDOR" | "SUPIR";

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
          (er.toLowerCase().includes("role is required") ||
            er.toLowerCase().includes("role_required"))
      ))
  );
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

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const clearError = () => {
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authClient.post("/api/auth/login", { email, password });
      await redirectByRole();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      const apiMsg = e?.response?.data?.message ?? "";
      const isAuthError =
        apiMsg === "INVALID_CREDENTIALS" ||
        apiMsg === "ACCOUNT_INACTIVE" ||
        e?.response?.status === 401;
      setError(isAuthError || !apiMsg ? "Invalid credentials. Please try again." : apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      await authClient.post("/api/auth/google-login", { idToken: credential });
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

  const handleRoleConfirm = async (role: Role, certNumber?: string) => {
    if (!pendingIdToken) return;
    setModalLoading(true);
    try {
      const body: Record<string, unknown> = { idToken: pendingIdToken, role };
      if (certNumber) body.mandorCertificationNumber = certNumber;
      await authClient.post("/api/auth/google-login", body);
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
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="Type here"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
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
          <Link
            href="/register"
            style={{ color: "#BB7354", textDecoration: "none", fontWeight: 700 }}
          >
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
