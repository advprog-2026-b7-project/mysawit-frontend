"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import {
  CheckCircleIcon,
  ClockIcon,
  HistoryIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
} from "@/components/layout/AdminIcons";
import {
  DashboardFeatureCard,
  DashboardHeader,
  DashboardStatCard,
  DashboardTable,
  StatusBadge,
} from "@/components/dashboard/DashboardComponents";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function SupirDashboardPage() {
  const { user, loading } = useRoleDashboard("SUPIR");
  const displayName = user?.nama || user?.username || "Supir";

  // TODO: Replace placeholder shipment stats and rows with Delivery service endpoints.
  const shipmentRows = [
    ["Plantation A", "Mill Center", "2.4 tons", <StatusBadge key="transit" label="IN TRANSIT" />],
    ["Plantation B", "Warehouse 3", "1.8 tons", <StatusBadge key="assigned" label="ASSIGNED" />],
  ];

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
            title="Assigned Shipments"
            value={3}
            badge="ACTIVE"
            Icon={TruckIcon}
            tone="beige"
          />
          <DashboardStatCard
            title="Completed Deliveries"
            value={12}
            badge="COMPLETED"
            Icon={CheckCircleIcon}
            tone="green"
          />
          <DashboardStatCard
            title="Pending Confirmation"
            value={1}
            badge="PENDING"
            Icon={ClockIcon}
            tone="pink"
          />
        </section>

        <section className="grid grid-cols-2 gap-8">
          <DashboardFeatureCard
            title="Assigned Shipments"
            subtitle="View pickup and delivery tasks"
            badge="3 Active"
            href="/supir/shipments"
            Icon={TruckIcon}
          />
          <DashboardFeatureCard
            title="Delivery History"
            subtitle="Review completed shipment records"
            href="/supir/history"
            Icon={HistoryIcon}
          />
          <DashboardFeatureCard
            title="Payment & Wallet"
            subtitle="View delivery earnings and wallet balance"
            href="/supir/wallet"
            Icon={WalletIcon}
          />
          <DashboardFeatureCard
            title="My Profile"
            subtitle="View account and driver information"
            href="/profile"
            Icon={UserIcon}
          />
        </section>

        <DashboardTable
          title="Today's Shipments"
          columns={["PICKUP", "DESTINATION", "LOAD", "STATUS"]}
          rows={shipmentRows}
        />
      </div>
    </AdminLayout>
  );
}
