"use client";

import { ReactNode, useState } from "react";
import SideNavBar from "./SideNavBar";
import { type MeResponse } from "@/features/admin/api";

interface MandorLayoutProps {
    activePage: string;
    children: ReactNode;
    currentUser?: MeResponse | null;
}

export default function MandorLayout({ activePage, children, currentUser }: MandorLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    // Tidak ada useEffect, tidak ada router, tidak ada getMe()
    // Semua auth guard sudah dihandle di useRoleDashboard

    if (!currentUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-[16px]">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <SideNavBar
                activePage={activePage}
                currentUser={currentUser}
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