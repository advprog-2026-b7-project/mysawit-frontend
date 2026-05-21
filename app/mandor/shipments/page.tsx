"use client";

import MandorLayout from "@/components/layout/MandorLayout";
import {useRoleDashboard} from "@/features/admin/useRoleDashboard";
import MandorShipmentList from "@/features/delivery/components/MandorShipmentList";

export default function MandorDeliveryPage() {
    const { user, loading } = useRoleDashboard("MANDOR");

    // Jangan pass user={null} ke layout saat loading
    // Biarkan layout handle sendiri via undefined
    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <MandorLayout activePage="Shipments" currentUser={user}>
            <MandorShipmentList />
        </MandorLayout>
    );
}