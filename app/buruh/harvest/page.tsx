"use client";

import { useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import HarvestForm from "@/features/harvest/components/HarvestForm";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function BuruhHarvestPage() {
  const { user, loading } = useRoleDashboard("BURUH");
  const [collapsed, setCollapsed] = useState(false);

  if (loading || !user) {
    return (
      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: "#52443D" }}>
        Loading harvest form...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SideNavBar
        activePage="Submit Harvest"
        currentUser={user}
        onCollapsedChange={setCollapsed}
      />
      <main
        style={{ marginLeft: collapsed ? 72 : 256 }}
        className="min-h-screen p-12 transition-[margin-left] duration-200 ease-in-out"
      >
        <HarvestForm />
      </main>
    </div>
  );
}
