"use client";

import { Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  getBuruhAssignment,
  getMe,
  getUserById,
  type AdminUser,
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

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [profile, setProfile] = useState<MeResponse | AdminUser | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingOther, setViewingOther] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (userId) {
          const otherUser = await getUserById(userId);
          setProfile(otherUser);
          setViewingOther(true);
        } else {
          const me = await getMe();
          setProfile(me);
          if (me.role === "BURUH") {
            setAssignment(await getBuruhAssignment(me.id));
          }
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [router, userId]);

  if (loading) {
    return (
      <AdminLayout activePage="Profile">
        <div className="text-[16px] text-[var(--color-text-body)]">Loading profile...</div>
      </AdminLayout>
    );
  }

  if (!profile) return null;

  const displayName = "nama" in profile ? (profile.nama || profile.username) : profile.username;

  function roleOf(p: MeResponse | AdminUser): Role {
    return p.role;
  }

  function namaOf(p: MeResponse | AdminUser): string | undefined {
    return "nama" in p ? p.nama : undefined;
  }

  const currentRole = roleOf(profile);
  const currentNama = namaOf(profile);

  return (
    <AdminLayout activePage="Profile">
      <div className="flex max-w-[1040px] flex-col gap-8">
        <header>
          {viewingOther && (
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="mb-4 text-[14px] font-bold text-[var(--color-icon-brown)]"
            >
              &larr; Back to my profile
            </button>
          )}
          <h1 className="admin-heading text-[48px] font-bold tracking-[-0.96px] text-[var(--color-text-heading)]">
            {viewingOther ? "User Profile" : "My Profile"}
          </h1>
          <p className="mt-2 text-[18px] font-normal text-[var(--color-text-body)]">
            {viewingOther ? "View user account details and role information" : "View your account details and role information"}
          </p>
        </header>

        <section className="flex items-center gap-8 rounded-[12px] border border-[var(--color-border)] bg-white p-8 shadow-sm">
          <div className="admin-heading flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#924A39] text-[28px] font-bold text-white">
            {initials(currentNama, profile.username)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="admin-heading text-[32px] font-semibold text-[var(--color-text-dark)]">
                {displayName}
              </h2>
              <RoleBadge role={currentRole} />
            </div>
            <p className="mt-1 text-[16px] text-[var(--color-text-body)]">@{profile.username}</p>
          </div>
        </section>

        <section>
          <h2 className="admin-heading mb-4 text-[24px] font-semibold text-[var(--color-text-heading)]">
            Information
          </h2>
          <div className="grid grid-cols-2 gap-6 rounded-[12px] border border-[var(--color-border)] bg-white p-6">
            <InfoField label="FULL NAME">{currentNama || "-"}</InfoField>
            <InfoField label="USERNAME" mono>@{profile.username}</InfoField>
            <InfoField label="EMAIL">{profile.email}</InfoField>
            <InfoField label="USER ID" mono>{profile.id}</InfoField>
            <InfoField label="ROLE"><RoleBadge role={currentRole} /></InfoField>
            <InfoField label="MEMBER SINCE">{formatDate("createdAt" in profile ? profile.createdAt : undefined)}</InfoField>
          </div>
        </section>

        {currentRole === "MANDOR" && (
          <section>
            <h2 className="admin-heading mb-4 text-[24px] font-semibold text-[var(--color-text-heading)]">
              Mandor Information
            </h2>
            <div className="rounded-[12px] border border-[var(--color-border)] bg-[#CEB7B1] p-6">
              <InfoField label="CERTIFICATION NUMBER" mono>
                {"mandorCertificationNumber" in profile ? (profile.mandorCertificationNumber || "-") : "-"}
              </InfoField>
            </div>
          </section>
        )}

        {currentRole === "BURUH" && !viewingOther && (
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
      </div>
    </AdminLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <AdminLayout activePage="Profile">
          <div className="text-[16px] text-[var(--color-text-body)]">Loading profile...</div>
        </AdminLayout>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
