"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FileTextIcon,
  LeafIcon,
  LogOutIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "./AdminIcons";

interface SideNavBarProps {
  activePage: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navItems = [
  { label: "Users", href: "/admin/users", Icon: UsersIcon },
  { label: "Plantation", href: "/plantation", Icon: LeafIcon },
  { label: "Shipments", href: "/delivery", Icon: TruckIcon },
  { label: "Payroll", href: "/payment", Icon: FileTextIcon },
  { label: "Wallet", href: "/payment", Icon: WalletIcon },
  { label: "Profile", href: "/profile", Icon: UserIcon },
];

export default function SideNavBar({ activePage, onCollapsedChange }: SideNavBarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
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
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label="Toggle sidebar"
        className="flex items-center gap-3 pb-8 text-left"
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

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ label, href, Icon }) => {
          const active = activePage === label;
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
          justifyContent: collapsed ? "center" : "center",
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

