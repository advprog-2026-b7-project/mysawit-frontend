"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  getBuruhAssignment,
  getMe,
  type Assignment,
  type MeResponse,
  type Role,
} from "@/features/admin/api";

const roleStyles: Record<Role, string> = {
  BURUH: "bg-[#857069] text-[#FFFBFF]",
  MANDOR: "bg-[#FFA088] text-[#793423]",
  SUPIR: "border border-[#85736C] bg-[#D7C2B9] text-[#1B1C1B]",
  ADMIN: "bg-[#A26647] text-[#FFFBFF]",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name?: string, fallback?: string) {
  const source = (name || fallback || "User").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.65px] ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[#F9EBE6] px-3 py-1 text-[12px] text-[var(--color-text-body)]">
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z" />
      </svg>
      Signed in with Google
    </span>
  );
}

function InfoField({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-[0.325px] text-[var(--color-text-body)]">
        {label}
      </p>
      <div
        className={`mt-2 text-[16px] font-normal text-[var(--color-text-dark)] ${
          mono ? "admin-mono text-[14px]" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        const me = await getMe();
        setProfile(me);
        // TODO: Filter sidebar nav items by role once role-specific navigation is finalized.
        if (me.role === "BURUH") {
          setAssignment(await getBuruhAssignment(me.id));
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout activePage="Profile">
        <div className="text-[16px] text-[var(--color-text-body)]">Loading profile...</div>
      </AdminLayout>
    );
  }

  if (!profile) return null;

  const displayName = profile.nama || profile.username;

  return (
    <AdminLayout activePage="Profile">
      <div className="flex max-w-[1040px] flex-col gap-8">
        <header>
          <h1 className="admin-heading text-[48px] font-bold tracking-[-0.96px] text-[var(--color-text-heading)]">
            My Profile
          </h1>
          <p className="mt-2 text-[18px] font-normal text-[var(--color-text-body)]">
            View your account details and role information
          </p>
        </header>

        <section className="flex items-center gap-8 rounded-[12px] border border-[var(--color-border)] bg-white p-8 shadow-sm">
          <div className="admin-heading flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#924A39] text-[28px] font-bold text-white">
            {initials(profile.nama, profile.username)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="admin-heading text-[32px] font-semibold text-[var(--color-text-dark)]">
                {displayName}
              </h2>
              <RoleBadge role={profile.role} />
            </div>
            <p className="mt-1 text-[16px] text-[var(--color-text-body)]">@{profile.username}</p>
            {profile.authProvider === "GOOGLE" && (
              <div className="mt-3">
                <GoogleBadge />
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="admin-heading mb-4 text-[24px] font-semibold text-[var(--color-text-heading)]">
            Information
          </h2>
          <div className="grid grid-cols-2 gap-6 rounded-[12px] border border-[var(--color-border)] bg-white p-6">
            <InfoField label="FULL NAME">{profile.nama || "-"}</InfoField>
            <InfoField label="USERNAME" mono>@{profile.username}</InfoField>
            <InfoField label="EMAIL">{profile.email}</InfoField>
            <InfoField label="USER ID" mono>{profile.id}</InfoField>
            <InfoField label="ROLE"><RoleBadge role={profile.role} /></InfoField>
            <InfoField label="MEMBER SINCE">{formatDate(profile.createdAt)}</InfoField>
          </div>
        </section>

        {profile.role === "MANDOR" && (
          <section>
            <h2 className="admin-heading mb-4 text-[24px] font-semibold text-[var(--color-text-heading)]">
              Mandor Information
            </h2>
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[#CEB7B1] p-6">
              <InfoField label="CERTIFICATION NUMBER" mono>
                {profile.mandorCertificationNumber || "-"}
              </InfoField>
            </div>
          </section>
        )}

        {profile.role === "BURUH" && (
          <section>
            <h2 className="admin-heading mb-4 text-[24px] font-semibold text-[var(--color-text-heading)]">
              Assignment Information
            </h2>
            <div className="rounded-[12px] border border-[var(--color-border)] bg-white p-6">
              {assignment ? (
                <div className="grid grid-cols-2 gap-6">
                  <InfoField label="ASSIGNED MANDOR">
                    {assignment.mandorNama || assignment.mandorName || assignment.mandorId}
                  </InfoField>
                  <InfoField label="ASSIGNED AT">
                    {formatDate(assignment.assignedAt || assignment.createdAt)}
                  </InfoField>
                </div>
              ) : (
                <p className="text-[16px] text-[var(--color-text-muted)]">
                  Not yet assigned to a Mandor
                </p>
              )}
            </div>
          </section>
        )}
        {/* TODO: Show Supir kebun assignment information after Plantation exposes it. */}
      </div>
    </AdminLayout>
  );
}
