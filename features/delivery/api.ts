import {CreateShipmentRequest, Shipment} from "@/features/delivery/types";

const BASE_URL = process.env.NEXT_PUBLIC_DELIVERY_API_URL || 'http://localhost:8082/deliveries';;

export const deliveryApi = {
    // Get available drivers untuk mandor (dari delivery backend yang sudah ada PlantationClient)
    getAvailableDrivers: async (authHeader: string): Promise<Driver[]> => {
        const response = await fetch(`${BASE_URL}/drivers/available`, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) return [];
        return response.json();
    },

// Get total approved harvest kg
    getTotalApprovedHarvestKg: async (authHeader: string): Promise<number> => {
        const response = await fetch(`${BASE_URL}/harvest/approved-weight`, {
            headers: { 'Authorization': authHeader },
        });
        if (!response.ok) return 0;
        const data = await response.json();
        return data.totalWeightKg ?? 0;
    },

// Create shipment dengan driver (kirim Authorization header)
    createShipmentWithDriver: async (
        data: { driverId: string; totalWeightKg: number },
        authHeader: string
    ): Promise<Shipment> => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message ?? 'Gagal membuat pengiriman');
        }
        return response.json();
    },
    updateStatus: async (id: string, status: string): Promise<Shipment> => {
        const response = await fetch(`${BASE_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Gagal mengubah status pengiriman');
        return response.json();
    },

    getOngoingByMandor: async (mandorId: string): Promise<Shipment[]> => {
        const response = await fetch(`${BASE_URL}/mandor/${mandorId}/ongoing`);
        if (!response.ok) throw new Error("Gagal memuat pengiriman");
        return response.json();
    },

    approveByMandor: async (id: string): Promise<Shipment> => {
        const response = await fetch(`${BASE_URL}/${id}/approve-mandor`, {
            method: "PATCH",
        });
        if (!response.ok) throw new Error("Gagal menyetujui pengiriman");
        return response.json();
    },

    rejectByMandor: async (id: string, reason: string): Promise<Shipment> => {
        const response = await fetch(`${BASE_URL}/${id}/reject-mandor`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error("Gagal menolak pengiriman");
        return response.json();
    },
};
