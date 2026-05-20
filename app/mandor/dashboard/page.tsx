"use client";

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
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function MandorDashboardPage() {
  const { user, loading } = useRoleDashboard("MANDOR");
  const displayName = user?.nama || user?.username || "Mandor";

  // TODO: Replace placeholders with harvest review, shipment, and team endpoints.
  const pendingReviews = 2;
  const activeShipments = 14;
  const teamMembers = 1;

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

        <section className="grid grid-cols-3 gap-8">
          <DashboardStatCard
            title="Pending Harvest Reviews"
            value={pendingReviews}
            badge="PENDING"
            Icon={ClockIcon}
            tone="beige"
          />
          <DashboardStatCard
            title="Active Shipments"
            value={activeShipments}
            badge="APPROVED"
            Icon={CheckCircleIcon}
            tone="green"
          />
          <DashboardStatCard
            title="Team Members"
            value={teamMembers}
            Icon={UsersIcon}
            tone="pink"
          />
        </section>

        <section className="grid grid-cols-2 gap-8">
          <DashboardFeatureCard
            title="Harvest Review"
            subtitle="Approve daily yields"
            badge="5 Pending"
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
            badge="8 Members"
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
