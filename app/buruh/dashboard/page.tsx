"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  CheckCircleIcon,
  ClockIcon,
  ClipboardListIcon,
  LeafIcon,
  XCircleIcon,
} from "@/components/layout/AdminIcons";
import {
  DashboardHeader,
  DashboardStatCard,
  DashboardTable,
  StatusBadge,
} from "@/components/dashboard/DashboardComponents";
import { getBuruhAssignment, type Assignment } from "@/features/admin/api";
import { harvestHistoryClient } from "@/features/harvest/historyApi";
import type { HarvestHistoryItem } from "@/features/harvest/historyTypes";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

function currentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function formatHarvestDate(item: HarvestHistoryItem) {
  const value = item.harvestDate || item.createdAt || item.submittedAt;
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BuruhDashboardPage() {
  const router = useRouter();
  const { user, loading } = useRoleDashboard("BURUH");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [recentHarvests, setRecentHarvests] = useState<HarvestHistoryItem[]>([]);
  const [stats, setStats] = useState({ pending: 0, approvedThisMonth: 0, rejected: 0 });
  const [harvestError, setHarvestError] = useState<string | null>(null);
  const displayName = user?.nama || user?.username || "Buruh";

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function loadAssignment() {
      setAssignment(await getBuruhAssignment(userId).catch(() => null));
    }

    void loadAssignment();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function loadHarvestSummary() {
      setHarvestError(null);
      try {
        const [recent, pending, approvedThisMonth, rejected] = await Promise.all([
          harvestHistoryClient.getHarvestHistory({ page: 0, size: 5 }),
          harvestHistoryClient.getHarvestCount({ status: "PENDING" }),
          harvestHistoryClient.getHarvestCount({
            status: "APPROVED",
            startDate: currentMonthStart(),
          }),
          harvestHistoryClient.getHarvestCount({ status: "REJECTED" }),
        ]);

        if (!active) return;
        setRecentHarvests(recent.content);
        setStats({ pending, approvedThisMonth, rejected });
      } catch (err) {
        if (!active) return;
        setHarvestError(err instanceof Error ? err.message : "Failed to load harvest summary.");
        setRecentHarvests([]);
        setStats({ pending: 0, approvedThisMonth: 0, rejected: 0 });
      }
    }

    void loadHarvestSummary();

    return () => {
      active = false;
    };
  }, [user]);

  const recentRows = recentHarvests.map((harvest) => [
    formatHarvestDate(harvest),
    `${Number(harvest.weightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`,
    harvest.notes || "-",
    <StatusBadge key={harvest.id} label={harvest.status} />,
  ]);

  if (loading) {
    return (
      <AdminLayout activePage="Dashboard" currentUser={user}>
        <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: "#53433D" }}>
          Loading dashboard...
        </div>
      </AdminLayout>
    );
  }

  const mandorName = assignment?.mandorNama || assignment?.mandorName || null;

  return (
    <AdminLayout activePage="Dashboard" currentUser={user}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        <DashboardHeader greeting={`Good morning, ${displayName}!`} />

        <section
          className="flex items-center justify-between px-8 py-7"
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
            borderRadius: 12,
            boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
          }}
        >
          <div className="flex items-center gap-7">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#EDE8E4] text-[#5B2012]">
              <ClipboardListIcon width={32} height={32} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#52443D",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                Your Mandor Supervisor
              </p>
              <h2
                className="admin-heading mt-2"
                style={{ fontSize: 24, fontWeight: 600, color: "#6D2615" }}
              >
                {mandorName || "Not yet assigned"}
              </h2>
            </div>
          </div>
          {mandorName && (
            <button
              type="button"
              onClick={() => { const mid = assignment?.mandorId; if (mid) router.push(`/profile?userId=${mid}`); }}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#854E31",
              }}
            >
              View Profile
            </button>
          )}
        </section>

        {harvestError && (
          <div
            style={{
              background: "rgba(186,26,26,0.08)",
              border: "1px solid rgba(186,26,26,0.2)",
              borderRadius: 8,
              padding: "12px 16px",
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              color: "#BA1A1A",
            }}
          >
            {harvestError}
          </div>
        )}

        <section className="grid grid-cols-3 gap-8">
          <DashboardStatCard
            title="Submissions awaiting review"
            value={stats.pending}
            badge="PENDING"
            Icon={ClockIcon}
            tone="beige"
          />
          <DashboardStatCard
            title="Successful harvests this month"
            value={stats.approvedThisMonth}
            badge="APPROVED"
            Icon={CheckCircleIcon}
            tone="green"
          />
          <DashboardStatCard
            title="Needs weight re-verification"
            value={stats.rejected}
            badge="REJECTED"
            Icon={XCircleIcon}
            tone="pink"
          />
        </section>

        <section className="grid grid-cols-2 gap-8">
          <button
            type="button"
            onClick={() => router.push("/buruh/harvest")}
            className="min-h-[280px] p-9 text-left transition"
            style={{
              background: "#FFFFFF",
              border: "1px solid #DBC1B9",
              borderRadius: 12,
              boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
            }}
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
            onClick={() => router.push("/buruh/harvests")}
            className="min-h-[280px] p-9 text-left transition"
            style={{
              background: "#FFFFFF",
              border: "1px solid #DBC1B9",
              borderRadius: 12,
              boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-[#F3E8E5] text-[#9A5134]">
              <ClipboardListIcon width={31} height={31} />
            </div>
            <h2 className="admin-heading mt-8 text-[28px] font-semibold text-[#6D2615]">
              My Harvests
            </h2>
            <p className="mt-5 max-w-[560px] text-[18px] leading-[1.65] text-[var(--color-text-body)]">
              Review every harvest you have submitted, including pending, approved, and rejected
              entries.
            </p>
          </button>
        </section>

        <DashboardTable
          title="Recent Submissions"
          actionLabel="View All"
          actionHref="/buruh/harvests"
          columns={["DATE", "WEIGHT", "NOTES", "STATUS"]}
          rows={recentRows}
          emptyLabel="You have not submitted any harvest yet."
        />
      </div>
    </AdminLayout>
  );
}
