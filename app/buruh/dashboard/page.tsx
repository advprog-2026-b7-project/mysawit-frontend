"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  CheckCircleIcon,
  ClockIcon,
  LeafIcon,
  WalletIcon,
  XCircleIcon,
} from "@/components/layout/AdminIcons";
import {
  DashboardHeader,
  DashboardStatCard,
  DashboardTable,
  StatusBadge,
} from "@/components/dashboard/DashboardComponents";
import { getBuruhAssignment, type Assignment } from "@/features/admin/api";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function BuruhDashboardPage() {
  const router = useRouter();
  const { user, loading } = useRoleDashboard("BURUH");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const displayName = user?.nama || user?.username || "Buruh";

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function loadAssignment() {
      setAssignment(await getBuruhAssignment(userId).catch(() => null));
    }

    void loadAssignment();
  }, [user]);

  // TODO: Replace placeholder harvest stats and recent rows with Harvest service endpoints.
  const recentRows = [
    ["15 May 2025", "92.0 kg", "\"Afternoon harvest...\"", <StatusBadge key="pending" label="PENDING" />],
    ["14 May 2025", "87.5 kg", "\"Fresh fruit bunches...\"", <StatusBadge key="approved-1" label="APPROVED" />],
    ["13 May 2025", "110.2 kg", "\"Large bunches...\"", <StatusBadge key="approved-2" label="APPROVED" />],
    ["12 May 2025", "45.0 kg", "\"Partial harvest...\"", <StatusBadge key="processing" label="PROCESSING" />],
  ];

  if (loading) {
    return (
      <AdminLayout activePage="Dashboard" currentUser={user}>
        <div className="text-[16px] text-[var(--color-text-body)]">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  const mandorName = assignment?.mandorNama || assignment?.mandorName || null;

  return (
    <AdminLayout activePage="Dashboard" currentUser={user}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        <DashboardHeader greeting={`Good morning, ${displayName}!`} />

        <section className="flex items-center justify-between rounded-[12px] border border-[var(--color-border)] bg-[#FCF8F6] px-8 py-7">
          <div className="flex items-center gap-7">
            <div className="h-[72px] w-[72px] rounded-full border-4 border-white bg-[#C17655]" />
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[3px] text-[#A3776D]">
                Your Mandor Supervisor
              </p>
              <h2 className="admin-heading mt-2 text-[24px] font-semibold text-[#6D2615]">
                {mandorName || "Not yet assigned"}
              </h2>
            </div>
          </div>
          {mandorName && (
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-[16px] font-bold text-[#6D2615]"
            >
              View Profile →
            </button>
          )}
        </section>

        <section className="grid grid-cols-3 gap-8">
          <DashboardStatCard
            title="Submissions awaiting review"
            value={2}
            badge="PENDING"
            Icon={ClockIcon}
            tone="beige"
          />
          <DashboardStatCard
            title="Successful harvests this month"
            value={14}
            badge="APPROVED"
            Icon={CheckCircleIcon}
            tone="green"
          />
          <DashboardStatCard
            title="Needs weight re-verification"
            value={1}
            badge="REJECTED"
            Icon={XCircleIcon}
            tone="pink"
          />
        </section>

        <section className="grid grid-cols-2 gap-8">
          <button
            type="button"
            onClick={() => router.push("/buruh/harvest")}
            className="min-h-[280px] rounded-[12px] border border-[var(--color-border)] bg-white p-9 text-left transition hover:shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-[#F3E8E5] text-[#9A5134]">
              <LeafIcon width={31} height={31} />
            </div>
            <h2 className="admin-heading mt-8 text-[28px] font-semibold text-[#6D2615]">
              Submit Harvest
            </h2>
            <p className="mt-5 max-w-[520px] text-[18px] leading-[1.65] text-[var(--color-text-body)]">
              Report your daily harvest weight and crop quality directly to your supervisor for
              rapid approval.
            </p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/buruh/wallet")}
            className="min-h-[280px] rounded-[12px] border border-[var(--color-border)] bg-white p-9 text-left transition hover:shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-[#F3E8E5] text-[#9A5134]">
              <WalletIcon width={31} height={31} />
            </div>
            <h2 className="admin-heading mt-8 text-[28px] font-semibold text-[#6D2615]">
              My Payment
            </h2>
            <p className="mt-5 max-w-[560px] text-[18px] leading-[1.65] text-[var(--color-text-body)]">
              View your payroll records, pending commissions, and historical payment statements in
              one place.
            </p>
            <p className="mt-8 text-[16px] font-bold text-[#9A5134]">Check Wallet</p>
          </button>
        </section>

        <DashboardTable
          title="Recent Submissions"
          actionLabel="View All"
          columns={["DATE", "WEIGHT", "NOTES", "STATUS"]}
          rows={recentRows}
        />
      </div>
    </AdminLayout>
  );
}
