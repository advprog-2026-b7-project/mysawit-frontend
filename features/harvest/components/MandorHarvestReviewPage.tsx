"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import HarvestHistoryList from "./HarvestHistoryList";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function MandorHarvestReviewPage() {
  const { user, loading } = useRoleDashboard("MANDOR");

  if (loading) {
    return (
      <AdminLayout activePage="Harvest Review" currentUser={user}>
        <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: "#53433D" }}>
          Loading harvest review...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="Harvest Review" currentUser={user}>
      <HarvestHistoryList
        title="Harvest Review"
        emptyLabel="No harvest submissions from your team yet."
        initialStatus="PENDING"
        showBuruhColumn
      />
    </AdminLayout>
  );
}
