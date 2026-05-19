"use client";

import { ReactNode, useEffect, useState } from "react";
import SideNavBar from "./SideNavBar";
import { getMe, type MeResponse } from "@/features/admin/api";

interface AdminLayoutProps {
  activePage: string;
  children: ReactNode;
  currentUser?: MeResponse | null;
}

export default function AdminLayout({ activePage, children, currentUser }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<MeResponse | null>(null);
  const resolvedUser = currentUser !== undefined ? currentUser : fetchedUser;

  useEffect(() => {
    if (currentUser !== undefined) return;

    if (!localStorage.getItem("token")) return;

    async function loadUser() {
      try {
        setFetchedUser(await getMe());
      } catch {
        setFetchedUser(null);
      }
    }

    void loadUser();
  }, [currentUser]);

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
