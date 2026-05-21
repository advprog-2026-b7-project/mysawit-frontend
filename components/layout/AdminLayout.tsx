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
    let active = true;

    if (currentUser === undefined) {
      getMe()
        .then((me) => {
          if (active) setFetchedUser(me);
        })
        .catch(() => undefined);
    }

    return () => {
      active = false;
    };
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
