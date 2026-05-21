import type { Shipment, Driver } from "@/features/delivery/types";

const BASE_URL = process.env.NEXT_PUBLIC_DELIVERY_API_URL || 'http://localhost:8082/deliveries';

export const deliveryApi = {
    // 1. Get available drivers
    getAvailableDrivers: async (plantationId: string, authHeader: string): Promise<any[]> => {
        const response = await fetch(`${BASE_URL}/drivers/available?plantationId=${plantationId}`, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) return [];

        const data = await response.json();
        return data; // Langsung return array supirnya
    },

    // 2. Get total approved harvest kg
    getTotalApprovedHarvestKg: async (authHeader: string): Promise<number> => {
        const response = await fetch(`${BASE_URL}/harvest/approved-weight`, {
            headers: { 'Authorization': authHeader },
        });
        if (!response.ok) return 0;

        // Perbaikan: Backend hanya mereturn angka (BigDecimal), bukan object.
        const data = await response.json();
        return typeof data === 'number' ? data : 0;
    },

    // 3. Create shipment
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

    // 4. Update status (Tambahkan authHeader!)
    updateStatus: async (id: string, status: string, authHeader: string): Promise<Shipment> => {
        const response = await fetch(`${BASE_URL}/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader // 👈 Wajib ada
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Gagal mengubah status pengiriman');
        return response.json();
    },

    // 5. Get ongoing by mandor (Tambahkan authHeader!)
    getOngoingByMandor: async (mandorId: string, authHeader: string): Promise<Shipment[]> => {
        const response = await fetch(`${BASE_URL}/mandor/${mandorId}/ongoing`, {
            headers: {
                'Authorization': authHeader // 👈 Wajib ada agar tidak 401 Unauthorized
            },
        });
        if (!response.ok) throw new Error("Gagal memuat pengiriman");

        // Jaga-jaga jika backend mereturn objek { data: [...] } (berdasarkan ApiSuccessResponse)
        const json = await response.json();
        return json.data ? json.data : json;
    },

    // 6. Approve by mandor (Tambahkan authHeader!)
    approveByMandor: async (id: string, authHeader: string): Promise<Shipment> => {
        const response = await fetch(`${BASE_URL}/${id}/approve-mandor`, {
            method: "PATCH",
            headers: {
                'Authorization': authHeader // 👈 Wajib ada
            },
        });
        if (!response.ok) throw new Error("Gagal menyetujui pengiriman");
        return response.json();
    },

    // 7. Reject by mandor (Tambahkan authHeader!)
    rejectByMandor: async (id: string, reason: string, authHeader: string): Promise<Shipment> => {
        const response = await fetch(`${BASE_URL}/${id}/reject-mandor`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader // 👈 Wajib ada
            },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error("Gagal menolak pengiriman");
        return response.json();
    },

    getMyPlantation: async (authHeader: string): Promise<{ plantationId: string } | null> => {
        const response = await fetch(`${BASE_URL}/my-plantation`, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) return null;
        return response.json();
    },
};