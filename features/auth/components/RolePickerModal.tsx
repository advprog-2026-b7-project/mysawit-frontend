"use client";

import { useState } from "react";
import Image from "next/image";

type Role = "BURUH" | "MANDOR" | "SUPIR";

interface RolePickerModalProps {
  onConfirm: (role: Role, certNumber?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

/* ── Inline SVG icons ─────────────────────────────────────────── */
function LeafIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function PersonIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TruckIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#4C6430" />
      <path d="M8 12.5l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GoogleG() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

/* ── Role definitions ─────────────────────────────────────────── */
const ROLES: { value: Role; label: string }[] = [
  { value: "MANDOR", label: "Mandor" },
  { value: "BURUH",  label: "Buruh"  },
  { value: "SUPIR",  label: "Supir"  },
];

function RoleIcon({ role, selected }: { role: Role; selected: boolean }) {
  const color = selected ? "#4C6430" : "#44483D";
  if (role === "MANDOR") return <LeafIcon color={color} />;
  if (role === "BURUH")  return <PersonIcon color={color} />;
  return <TruckIcon color={color} />;
}

/* ── Modal ────────────────────────────────────────────────────── */
export default function RolePickerModal({ onConfirm, onCancel, loading = false }: RolePickerModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [certNumber, setCertNumber]     = useState("");
  const [certError, setCertError]       = useState("");

  const isDisabled =
    !selectedRole ||
    loading ||
    (selectedRole === "MANDOR" && !certNumber.trim());

  const handleConfirm = () => {
    if (!selectedRole) return;
    if (selectedRole === "MANDOR" && !certNumber.trim()) {
      setCertError("Certification number is required.");
      return;
    }
    onConfirm(selectedRole, selectedRole === "MANDOR" ? certNumber.trim() : undefined);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(28,28,21,0.6)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          width: "420px",
          padding: "32px",
          border: "1px solid #C5C8BA",
          borderRadius: "16px",
          boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.25)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div style={{ width: "32px", height: "4px", backgroundColor: "#C5C8BA", borderRadius: "2px", margin: "0 auto 20px" }} />

        {/* nyawitt logo */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <Image
            src="/logo-design.png"
            alt="nyawitt"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Google G badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div
            style={{
              width: "48px", height: "48px",
              backgroundColor: "white",
              border: "1px solid #C5C8BA",
              boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <GoogleG />
          </div>
        </div>

        {/* Heading */}
        <h2 style={{ textAlign: "center", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "20px", color: "#1C1C15", margin: "0 0 8px" }}>
          One More Step
        </h2>

        {/* Subtext */}
        <p style={{ textAlign: "center", fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "14px", color: "#44483D", margin: "0 0 24px" }}>
          Pick a role to finish your register via Google.
        </p>

        {/* Role cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          {ROLES.map(({ value, label }) => {
            const isSelected = selectedRole === value;
            return (
              <div key={value}>
                {/* Card */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { setSelectedRole(value); setCertError(""); if (value !== "MANDOR") setCertNumber(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedRole(value); setCertError(""); } }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: isSelected ? "2px solid #4C6430" : "1px solid #C5C8BA",
                    backgroundColor: isSelected ? "rgba(100,125,70,0.1)" : "white",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    userSelect: "none",
                  }}
                >
                  {/* Icon box */}
                  <div
                    style={{
                      width: "40px", height: "40px",
                      borderRadius: "12px",
                      backgroundColor: isSelected ? "white" : "#F2EEE2",
                      boxShadow: isSelected ? "0px 1px 3px rgba(0,0,0,0.12)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <RoleIcon role={value} selected={isSelected} />
                  </div>

                  {/* Label */}
                  <span style={{ flex: 1, fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "#1C1C15" }}>
                    {label}
                  </span>

                  {/* Checkmark */}
                  {isSelected && <CheckCircle />}
                </div>

                {/* Mandor cert number — animated reveal */}
                {value === "MANDOR" && (
                  <div
                    style={{
                      maxHeight: isSelected ? "120px" : "0",
                      overflow: "hidden",
                      opacity: isSelected ? 1 : 0,
                      transition: "max-height 0.3s ease, opacity 0.25s ease",
                      marginTop: isSelected ? "8px" : "0",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: "12px",
                        color: "#1C1C15",
                        marginBottom: "6px",
                      }}
                    >
                      Mandor Certification Number
                    </label>
                    <input
                      type="text"
                      placeholder="Type here"
                      value={certNumber}
                      onChange={(e) => { setCertNumber(e.target.value); setCertError(""); }}
                      className="modal-cert-input"
                      style={{
                        width: "266px",
                        border: certError ? "1px solid #EF4444" : "1px solid #C5C8BA",
                        borderRadius: "8px",
                        padding: "9px 12px",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        color: "#1C1C15",
                        boxSizing: "border-box",
                        backgroundColor: "white",
                      }}
                    />
                    {certError && (
                      <span style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#EF4444", marginTop: "4px" }}>
                        {certError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleConfirm}
          disabled={isDisabled}
          style={{
            width: "100%", height: "44px",
            backgroundColor: "#8D4D31",
            border: "none",
            borderRadius: "8px",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            color: "white",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.6 : 1,
            marginBottom: "8px",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Processing..." : "Continue"}
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            width: "100%",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            color: "#44483D",
            padding: "8px 0",
            textAlign: "center",
          }}
        >
          Cancel and Exit
        </button>
      </div>
    </div>
  );
}
