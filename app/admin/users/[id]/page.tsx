"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  getMe,
  getUserById,
  type AdminUser,
  type Role,
} from "@/features/admin/api";

const roleStyles: Record<Role, string> = {
  BURUH: "bg-[#857069] text-[#FFFBFF]",
  MANDOR: "bg-[#FFA088] text-[#793423]",
  SUPIR: "border border-[#85736C] bg-[#D7C2B9] text-[#1B1C1B]",
  ADMIN: "bg-[#A26647] text-[#FFFBFF]",
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.65px] ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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
        className={`mt-2 text-[16px] text-[var(--color-text-dark)] ${
          mono ? "admin-mono text-[14px]" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe();
        if (me.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setUser(await getUserById(params.id));
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        setError(status === 404 ? "User not found" : "Failed to load user detail");
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [params.id, router]);

  if (loading) {
    return (
      <AdminLayout activePage="Users">
        <div className="text-[16px] text-[var(--color-text-body)]">Loading user...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="Users">
      <div className="flex max-w-[1040px] flex-col gap-8">
        <header>
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="mb-4 text-[14px] font-bold text-[var(--color-icon-brown)]"
          >
            Back to users
          </button>
          <h1 className="admin-heading text-[50px] font-bold tracking-[-1.25px] text-[var(--color-text-heading)]">
            User Detail
          </h1>
        </header>

        {error && (
          <div className="rounded-[10px] border border-[#E7B8B8] bg-[#FFF4F4] px-4 py-3 text-[14px] font-semibold text-[#BA1A1A]">
            {error}
          </div>
        )}

        {user && (
          <section className="rounded-[12px] border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <h2 className="admin-heading mb-6 text-[24px] font-semibold text-[var(--color-text-heading)]">
              Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="FULL NAME">{user.nama || "-"}</InfoField>
              <InfoField label="USERNAME" mono>
                @{user.username}
              </InfoField>
              <InfoField label="EMAIL">{user.email}</InfoField>
              <InfoField label="USER ID" mono>
                {user.id}
              </InfoField>
              <InfoField label="ROLE">
                <RoleBadge role={user.role} />
              </InfoField>
              <InfoField label="WALLET BALANCE">{user.walletBalance ?? 0}</InfoField>
              <InfoField label="MEMBER SINCE">{formatDate(user.createdAt)}</InfoField>
              <InfoField label="CERTIFICATION NUMBER" mono>
                {user.role === "MANDOR" ? user.mandorCertificationNumber || "-" : "-"}
              </InfoField>
              <InfoField label="ASSIGNED MANDOR ID" mono>
                {user.role === "BURUH" ? user.mandorId || "Unassigned" : "-"}
              </InfoField>
              {/* TODO: Show kebun fields after Plantation module integration exposes them. */}
              <InfoField label="KEBUN">-</InfoField>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}
