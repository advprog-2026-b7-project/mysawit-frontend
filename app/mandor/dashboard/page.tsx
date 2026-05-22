"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  CheckCircleIcon,
  ClockIcon,
  LeafIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/layout/AdminIcons";
import {
  DashboardFeatureCard,
  DashboardHeader,
  DashboardStatCard,
} from "@/components/dashboard/DashboardComponents";
import { harvestHistoryClient } from "@/features/harvest/historyApi";
import { getAssignmentsByMandorApi } from "@/features/profile/api";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

function currentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export default function MandorDashboardPage() {
  const { user, loading } = useRoleDashboard("MANDOR");
  const [stats, setStats] = useState({ pendingReviews: 0, approvedThisMonth: 0, teamMembers: 0 });
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const displayName = user?.nama || user?.username || "Mandor";

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    let active = true;

    async function loadSummary() {
      setSummaryError(null);
      try {
        const [pendingReviews, approvedThisMonth, assignments] = await Promise.all([
          harvestHistoryClient.getHarvestCount({ status: "PENDING" }),
          harvestHistoryClient.getHarvestCount({
            status: "APPROVED",
            startDate: currentMonthStart(),
          }),
          getAssignmentsByMandorApi(userId).catch(() => []),
        ]);

        if (!active) return;
        setStats({
          pendingReviews,
          approvedThisMonth,
          teamMembers: assignments.length,
        });
      } catch (err) {
        if (!active) return;
        setSummaryError(err instanceof Error ? err.message : "Failed to load dashboard summary.");
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <AdminLayout activePage="Dashboard" currentUser={user}>
        <div className="text-[16px] text-[var(--color-text-body)]">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="Dashboard" currentUser={user}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12">
        <DashboardHeader greeting={`Good morning, ${displayName}!`} />

        {summaryError && (
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
            {summaryError}
          </div>
        )}

        <section className="grid grid-cols-3 gap-8">
          <DashboardStatCard
            title="Pending Harvest Reviews"
            value={stats.pendingReviews}
            badge="PENDING"
            Icon={ClockIcon}
            tone="beige"
          />
          <DashboardStatCard
            title="Approved harvests this month"
            value={stats.approvedThisMonth}
            badge="APPROVED"
            Icon={CheckCircleIcon}
            tone="green"
          />
          <DashboardStatCard
            title="Team Members"
            value={stats.teamMembers}
            Icon={UsersIcon}
            tone="pink"
          />
        </section>

        <section className="grid grid-cols-2 gap-8">
          <DashboardFeatureCard
            title="Harvest Review"
            subtitle="Approve daily yields"
            badge={`${stats.pendingReviews} Pending`}
            href="/mandor/harvest-review"
            Icon={LeafIcon}
          />
          <DashboardFeatureCard
            title="Shipments"
            subtitle="Track plantation logistics"
            badge="2 Active"
            href="/mandor/shipments"
            Icon={TruckIcon}
          />
          <DashboardFeatureCard
            title="My Team"
            subtitle="Manage field workers"
            badge={`${stats.teamMembers} Members`}
            href="/mandor/team"
            Icon={UsersIcon}
            iconTone="green"
          />
          <DashboardFeatureCard
            title="Payment & Wallet"
            subtitle="View earnings & history"
            href="/mandor/wallet"
            Icon={WalletIcon}
          />
        </section>

      </div>
    </AdminLayout>
  );
}
