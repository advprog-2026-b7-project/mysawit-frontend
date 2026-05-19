"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNavBar from "./SideNavBar";
import { getMe, type MeResponse } from "@/features/admin/api";

interface AdminLayoutProps {
  activePage: string;
  children: ReactNode;
  currentUser?: MeResponse | null;
}

export default function AdminLayout({ activePage, children, currentUser }: AdminLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<MeResponse | null>(null);
  const resolvedUser = currentUser !== undefined ? currentUser : fetchedUser;

  useEffect(() => {
    // If token is missing, redirect to login — that's the only hard gate.
    if (!localStorage.getItem("token")) {
      router.replace("/auth/login");
      return;
    }

    // If currentUser was passed in by the page (e.g. dashboard uses useRoleDashboard),
    // skip fetching again to avoid duplicate calls.
    if (currentUser !== undefined) return;

    // Fetch user for sidebar display only — do NOT remove the token or redirect on failure.
    getMe()
      .then((me) => setFetchedUser(me))
      .catch(() => {
        // Ignore — sidebar will show without a user name. Individual API calls
        // will surface 401s if the token is truly invalid.
      });
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-white">
      <SideNavBar
        activePage={activePage}
        currentUser={resolvedUser}
        onCollapsedChange={setCollapsed}
      />
      <main
        style={{ marginLeft: collapsed ? 72 : 256 }}
        className="min-h-screen p-12 transition-[margin-left] duration-200 ease-in-out"
      >
        {children}
      </main>
    </div>
  );
}
