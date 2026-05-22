"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { MeResponse, Role } from "@/features/admin/api";
import { dashboardPathForRole } from "@/features/admin/routing";
import { logoutApi } from "@/features/auth/api";
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

type Theme = {
  sidebarBg: string;
  sidebarBorder: string;
  brand: string;
  brandDark: string;
  accent: string;
  accentSoft: string;
  accentHover: string;
  activeText: string;
  logoutBg: string;
  toggleBg: string;
};

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
    { label: "Payroll", href: "/admin/payment", Icon: FileTextIcon },
    { label: "Wallet", href: "/admin/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
  MANDOR: [
    { label: "Dashboard", href: "/mandor/dashboard", Icon: LayoutDashboardIcon },
    { label: "Harvest Review", href: "/mandor/harvest-review", Icon: LeafIcon },
    { label: "Shipments", href: "/mandor/shipments", Icon: TruckIcon },
    { label: "Team Payroll", href: "/mandor/payroll", Icon: FileTextIcon },
    { label: "Wallet", href: "/mandor/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
  BURUH: [
    { label: "Dashboard", href: "/buruh/dashboard", Icon: LayoutDashboardIcon },
    { label: "Submit Harvest", href: "/buruh/harvest", Icon: LeafIcon },
    { label: "My Payroll", href: "/buruh/payroll", Icon: FileTextIcon },
    { label: "Wallet", href: "/buruh/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
  SUPIR: [
    { label: "Dashboard", href: "/supir/dashboard", Icon: LayoutDashboardIcon },
    { label: "Assigned Shipments", href: "/supir/shipments", Icon: TruckIcon },
    { label: "Delivery History", href: "/supir/history", Icon: HistoryIcon },
    { label: "My Payroll", href: "/supir/payroll", Icon: FileTextIcon },
    { label: "Wallet", href: "/supir/wallet", Icon: WalletIcon },
    { label: "Profile", href: "/profile", Icon: UserIcon },
  ],
};

function isRole(value?: string | null): value is Role {
  return value === "ADMIN" || value === "MANDOR" || value === "BURUH" || value === "SUPIR";
}

const themeByRole: Record<Role, Theme> = {
  ADMIN: {
    sidebarBg: "rgba(248, 245, 242, 0.96)",
    sidebarBorder: "rgba(216, 194, 186, 0.9)",
    brand: "#5B2012",
    brandDark: "#6D2615",
    accent: "#BB7354",
    accentSoft: "rgba(187, 115, 84, 0.12)",
    accentHover: "rgba(187, 115, 84, 0.08)",
    activeText: "#FFFFFF",
    logoutBg: "#5B2012",
    toggleBg: "#FFFFFF",
  },
  MANDOR: {
    sidebarBg: "rgba(249, 246, 240, 0.96)",
    sidebarBorder: "rgba(220, 201, 181, 0.9)",
    brand: "#6D2615",
    brandDark: "#8A4B2F",
    accent: "#A35A3A",
    accentSoft: "rgba(163, 90, 58, 0.12)",
    accentHover: "rgba(163, 90, 58, 0.08)",
    activeText: "#FFFFFF",
    logoutBg: "#6D2615",
    toggleBg: "#FFFFFF",
  },
  BURUH: {
    sidebarBg: "rgba(248, 247, 243, 0.98)",
    sidebarBorder: "rgba(226, 211, 196, 0.95)",
    brand: "#5B2012",
    brandDark: "#8A4B2F",
    accent: "#4C6430",
    accentSoft: "rgba(76, 100, 48, 0.12)",
    accentHover: "rgba(76, 100, 48, 0.08)",
    activeText: "#FFFFFF",
    logoutBg: "#5B2012",
    toggleBg: "#FFFFFF",
  },
  SUPIR: {
    sidebarBg: "rgba(247, 248, 250, 0.98)",
    sidebarBorder: "rgba(208, 218, 228, 0.95)",
    brand: "#1F4261",
    brandDark: "#2F5F8A",
    accent: "#2F5F8A",
    accentSoft: "rgba(47, 95, 138, 0.12)",
    accentHover: "rgba(47, 95, 138, 0.08)",
    activeText: "#FFFFFF",
    logoutBg: "#1F4261",
    toggleBg: "#FFFFFF",
  },
};

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
  const theme = role ? themeByRole[role] : themeByRole.ADMIN;

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
    router.push("/dashboard");
  };

  const logout = () => {
    void logoutApi()
      .catch(() => undefined)
      .finally(() => {
        router.push("/login");
      });
  };

  return (
    <aside
      style={{
        width: collapsed ? 72 : 256,
        background: theme.sidebarBg,
        borderRight: `1px solid ${theme.sidebarBorder}`,
        boxShadow: "0px 10px 30px rgba(91,32,18,0.06)",
      }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col px-4 py-8 transition-[width] duration-200 ease-in-out backdrop-blur"
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
                color: theme.brand,
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
          style={{ background: theme.toggleBg, color: theme.brand, borderColor: theme.sidebarBorder }}
        >
          {collapsed ? (
            <ChevronRightIcon width={15} height={15} />
          ) : (
            <ChevronLeftIcon width={15} height={15} />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ label, href, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`) || activePage === label;
          return (
            <button
              key={label}
              type="button"
              title={collapsed ? label : undefined}
              onClick={() => router.push(href)}
              style={{
                background: active ? theme.accent : "transparent",
                color: active ? theme.activeText : theme.brand,
                padding: collapsed ? "12px" : "12px 16px 12px 18px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              className="group flex items-center gap-3 rounded-full transition-colors"
              onMouseEnter={(event) => {
                if (!active) {
                  event.currentTarget.style.background = theme.accentHover;
                }
              }}
              onMouseLeave={(event) => {
                if (!active) {
                  event.currentTarget.style.background = "transparent";
                }
              }}
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
          background: theme.logoutBg,
          boxShadow: "0px 6px 18px rgba(91,32,18,0.12)",
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
