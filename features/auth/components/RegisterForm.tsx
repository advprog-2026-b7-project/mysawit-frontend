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
    const role: string = res.data?.role ?? "";
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

function validatePassword(pw: string): string {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Must contain at least 1 uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Must contain at least 1 digit.";
  if (!/[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/.test(pw))
    return "Must contain at least 1 special character.";
  return "";
}

export default function RegisterForm() {
  const [username, setUsername]               = useState("");
  const [nama, setNama]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole]                       = useState<Role | "">("");
  const [certNumber, setCertNumber]           = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading]           = useState(false);

  // Google OAuth role picker state
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [modalLoading, setModalLoading]     = useState(false);

  // Route guard
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      window.location.href = "/dashboard";
    }
  }, []);

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));

  /* ── Client-side validation ────────────────────────────────── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!username.trim())        errs.username = "Username is required.";
    if (!nama.trim())            errs.nama = "Name is required.";
    if (!email.trim())           errs.email = "Email is required.";
    if (!password)               errs.password = "Password is required.";
    else {
      const pwErr = validatePassword(password);
      if (pwErr) errs.password = pwErr;
    }
    if (!confirmPassword)        errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (!role)                   errs.role = "Please select a role.";
    if (role === "MANDOR" && !certNumber.trim())
      errs.certNumber = "Certification number is required for Mandor.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Register submit ───────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const body: Record<string, unknown> = { username, nama, email, password, role };
      if (role === "MANDOR" && certNumber.trim())
        body.mandorCertificationNumber = certNumber.trim();

      const res = await authClient.post("/api/auth/register", body);
      const token = extractToken(res.data as Record<string, unknown>);
      if (token) localStorage.setItem("token", token);
      await redirectByRole();
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string; errors?: string[] } };
      };
      const msg     = e?.response?.data?.message ?? "";
      const apiErrs = e?.response?.data?.errors  ?? [];
      const has = (code: string) => msg === code || apiErrs.includes(code);

      if (has("EMAIL_ALREADY_EXISTS")) {
        setFieldErrors((p) => ({ ...p, email: "This email is already registered." }));
      } else if (has("USERNAME_ALREADY_EXISTS")) {
        setFieldErrors((p) => ({ ...p, username: "This username is already taken." }));
      } else if (has("CERT_NUMBER_ALREADY_EXISTS")) {
        setFieldErrors((p) => ({ ...p, certNumber: "This certification number is already in use." }));
      } else if (has("VALIDATION_FAILED")) {
        setGeneralError("Validation failed. Please check your inputs.");
      } else {
        setGeneralError(msg || "Registration failed. Please try again.");
      }
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
      localStorage.setItem("token", token);
      await redirectByRole();
    } catch (err: unknown) {
      if (isRoleRequired(err)) {
        setPendingIdToken(credential);
      } else {
        const e = err as { response?: { data?: { message?: string } } };
        setGeneralError(e?.response?.data?.message || "Google sign-in failed. Please try again.");
      }
    }
  };

  const handleRoleConfirm = async (selectedRole: Role, certNum?: string) => {
    if (!pendingIdToken) return;
    setModalLoading(true);
    try {
      const body: Record<string, unknown> = { idToken: pendingIdToken, role: selectedRole };
      if (certNum) body.mandorCertificationNumber = certNum;
      const res = await authClient.post("/api/auth/google-login", body);
      const token = extractToken(res.data as Record<string, unknown>);
      if (!token) throw new Error("No token in response.");
      localStorage.setItem("token", token);
      setPendingIdToken(null);
      await redirectByRole();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setGeneralError(e?.response?.data?.message || "Registration failed. Please try again.");
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
          Register Now!
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Username"
            placeholder="Type here"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearFieldError("username"); }}
            error={fieldErrors.username}
          />
          <TextInput
            label="Name"
            placeholder="Type here"
            value={nama}
            onChange={(e) => { setNama(e.target.value); clearFieldError("nama"); }}
            error={fieldErrors.nama}
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="Type here"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
            error={fieldErrors.email}
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="Type here"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
            error={fieldErrors.password}
          />
          <TextInput
            label="Confirm Password"
            type="password"
            placeholder="Type here"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
            error={fieldErrors.confirmPassword}
          />

          {/* Role selector */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "11.2px",
                color: "#525252",
                marginBottom: "6px",
              }}
            >
              Role
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role | "");
                clearFieldError("role");
                if (e.target.value !== "MANDOR") setCertNumber("");
              }}
              className="auth-select"
              style={{
                width: "100%",
                border: fieldErrors.role ? "0.8px solid #EF4444" : "0.8px solid #D1D5DB",
                borderRadius: "6.4px",
                height: "38.4px",
                padding: "0 32px 0 12.8px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: "12.8px",
                color: role ? "#1C1C15" : "#D1D5DB",
                boxSizing: "border-box",
                backgroundColor: "white",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23525252' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                cursor: "pointer",
              }}
            >
              <option value="" disabled style={{ color: "#D1D5DB" }}>
                Choose a role
              </option>
              <option value="BURUH">Buruh</option>
              <option value="MANDOR">Mandor</option>
              <option value="SUPIR">Supir</option>
            </select>
            {fieldErrors.role && (
              <span
                style={{
                  display: "block",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 400,
                  fontSize: "11px",
                  color: "#EF4444",
                  marginTop: "4px",
                }}
              >
                {fieldErrors.role}
              </span>
            )}
          </div>

          {/* Mandor cert number — animated reveal */}
          <div
            style={{
              overflow: "hidden",
              maxHeight: role === "MANDOR" ? "120px" : "0",
              opacity: role === "MANDOR" ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.25s ease",
            }}
          >
            <TextInput
              label="Mandor Certification Number"
              placeholder="Type here"
              value={certNumber}
              onChange={(e) => { setCertNumber(e.target.value); clearFieldError("certNumber"); }}
              error={fieldErrors.certNumber}
            />
          </div>

          {/* General error */}
          {generalError && (
            <div
              style={{
                padding: "10px 12px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "6px",
                fontFamily: "'Lato', sans-serif",
                fontSize: "11.2px",
                color: "#DC2626",
                marginBottom: "12px",
              }}
            >
              {generalError}
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <PrimaryButton type="submit" label="Register" loading={loading} disabled={loading} />
          </div>
        </form>

        <OrDivider />

        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={() => setGeneralError("Google sign-in failed.")}
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
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#BB7354", textDecoration: "none", fontWeight: 700 }}>
            Login Now
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
