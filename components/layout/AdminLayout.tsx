"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNavBar from "./SideNavBar";
import { getMe, type MeResponse } from "@/features/admin/api";
import { getTokenCookie } from "@/services/tokenCookie";

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
  const checkingAccess = currentUser === undefined && fetchedUser === null;

  useEffect(() => {
    // If token is missing, redirect to login — that's the only hard gate.
    if (!getTokenCookie()) {
      router.replace("/auth/login");
      return;
    }

    if (currentUser !== undefined) return;

    getMe()
      .then((me) => {
        if (!active) return;
        setFetchedUser(me);
      })
      .catch(() => {
        router.replace("/auth/login");
      });

    return () => {
      active = false;
    };
  }, [currentUser, router]);

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[16px] text-[var(--color-text-body)]">
        Loading...
      </div>
    );
  }

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
