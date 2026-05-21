"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import HarvestHistoryList from "./HarvestHistoryList";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function BuruhHarvestHistoryPage() {
  const { user, loading } = useRoleDashboard("BURUH");

  if (loading) {
    return (
      <AdminLayout activePage="My Harvests" currentUser={user}>
        <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: "#53433D" }}>
          Loading harvest history...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="My Harvests" currentUser={user}>
      <HarvestHistoryList />
    </AdminLayout>
  );
}
