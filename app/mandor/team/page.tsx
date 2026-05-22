"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function MandorTeamPage() {
  const { user, loading } = useRoleDashboard("MANDOR");

  return (
    <AdminLayout activePage="My Team" currentUser={user}>
      <div style={{ padding: "32px 0" }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 50,
            color: "#5B2012",
            margin: 0,
          }}
        >
          My Team
        </h1>
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#52443D",
            margin: "8px 0 0 0",
          }}
        >
          {loading ? "Loading..." : "Team management coming soon."}
        </p>
      </div>
    </AdminLayout>
  );
}
