"use client";

import { ReactNode, useState } from "react";
import SideNavBar from "./SideNavBar";

interface AdminLayoutProps {
  activePage: string;
  children: ReactNode;
}

export default function AdminLayout({ activePage, children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <SideNavBar activePage={activePage} onCollapsedChange={setCollapsed} />
      <main
        style={{ marginLeft: collapsed ? 72 : 256 }}
        className="min-h-screen p-12 transition-[margin-left] duration-200 ease-in-out"
      >
        {children}
      </main>
    </div>
  );
}

