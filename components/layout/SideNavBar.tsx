"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { MeResponse, Role } from "@/features/admin/api";
import { dashboardPathForRole } from "@/features/admin/routing";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  LeafIcon,
  LogOutIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "./AdminIcons";

interface SideNavBarProps {
  activePage: string;
  currentUser?: MeResponse | null;
  onCollapsedChange?: (collapsed: boolean) => void;
}

type NavItem = {
  label: string;
  href: string;
  Icon: typeof UsersIcon;
};

const navByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", Icon: LayoutDashboardIcon },
    { label: "Users", href: "/admin/users", Icon: UsersIcon },
    { label: "Plantation", href: "/admin/plantations", Icon: LeafIcon },
    { label: "Shipments", href: "/admin/shipments", Icon: TruckIcon },
    { label: "Payroll", href: "/admin/payroll", Icon: FileTextIcon },
    { label: "Wallet", href: "/admin/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
  MANDOR: [
    { label: "Dashboard", href: "/mandor/dashboard", Icon: LayoutDashboardIcon },
    { label: "Harvest Review", href: "/mandor/harvest-review", Icon: LeafIcon },
    { label: "Shipments", href: "/mandor/shipments", Icon: TruckIcon },
    { label: "My Team", href: "/mandor/team", Icon: UsersIcon },
    { label: "Payment & Wallet", href: "/mandor/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
  BURUH: [
    { label: "Dashboard", href: "/buruh/dashboard", Icon: LayoutDashboardIcon },
    { label: "Submit Harvest", href: "/buruh/harvest", Icon: LeafIcon },
    { label: "My Payment", href: "/buruh/payment", Icon: FileTextIcon },
    { label: "Wallet", href: "/buruh/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
  SUPIR: [
    { label: "Dashboard", href: "/supir/dashboard", Icon: LayoutDashboardIcon },
    { label: "Assigned Shipments", href: "/supir/shipments", Icon: TruckIcon },
    { label: "Delivery History", href: "/supir/history", Icon: HistoryIcon },
    { label: "Payment & Wallet", href: "/supir/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
};

function isRole(value?: string | null): value is Role {
  return value === "ADMIN" || value === "MANDOR" || value === "BURUH" || value === "SUPIR";
}

export default function SideNavBar({
  activePage,
  currentUser,
  onCollapsedChange,
}: SideNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const role = isRole(currentUser?.role) ? currentUser.role : null;
  const navItems = useMemo(() => (role ? navByRole[role] : navByRole.ADMIN), [role]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  const goToDashboard = () => {
    if (role) {
      router.push(dashboardPathForRole(role));
      return;
    }
    router.push(localStorage.getItem("token") ? "/dashboard" : "/login");
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: collapsed ? 72 : 256,
        background: "var(--color-sidebar-bg)",
        borderRight: "1px solid var(--color-sidebar-border)",
        boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
      }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col px-4 py-8 transition-[width] duration-200 ease-in-out"
    >
      <div className="relative pb-8">
        <button
          type="button"
          onClick={goToDashboard}
          aria-label="Go to dashboard"
          className="flex items-center gap-3 text-left"
        >
          <Image src="/logo-design.png" alt="nyawitt logo" width={40} height={40} />
          {!collapsed && (
            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 31,
                color: "var(--color-brand)",
              }}
            >
              nyawitt
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-7 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-brand)] shadow-sm"
        >
          {collapsed ? <ChevronRightIcon width={15} height={15} /> : <ChevronLeftIcon width={15} height={15} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`) || activePage === label;
          return (
            <button
              key={label}
              type="button"
              title={collapsed ? label : undefined}
              onClick={() => router.push(href)}
              style={{
                background: active ? "var(--color-primary)" : "transparent",
                color: active ? "#FFFFFF" : "var(--color-brand)",
                padding: collapsed ? "12px" : "12px 16px 12px 18px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              className="group flex items-center gap-3 rounded-full transition-colors hover:bg-[rgba(187,115,84,0.1)]"
            >
              <Icon width={20} height={20} />
              {!collapsed && (
                <span
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        title={collapsed ? "Logout" : undefined}
        style={{
          background: "var(--color-brand-dark)",
          boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
          justifyContent: "center",
        }}
        className="flex h-[38px] w-full items-center gap-2 rounded-full text-white"
      >
        {collapsed ? (
          <LogOutIcon width={18} height={18} />
        ) : (
          <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 12 }}>
            Logout
          </span>
        )}
      </button>
    </aside>
  );
}
