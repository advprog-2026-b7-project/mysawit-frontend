import {CreateShipmentRequest, Shipment} from "@/features/delivery/types";

const BASE_URL = 'http://localhost:8080/deliveries';

export const deliveryApi = {
    // POST: Buat pengiriman baru
    createShipment: async (data: CreateShipmentRequest): Promise<Shipment> => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Gagal membuat pengiriman');
        return response.json();
    },

    // PATCH: Assign Driver (Yang tadi kita tes di Postman pakai PATCH)
    assignDriver: async (id: string, driverId: string): Promise<Shipment> => {
        const response = await fetch(`${BASE_URL}/${id}/assign-driver`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId }),
        });
        if (!response.ok) throw new Error('Gagal menugaskan supir');
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
};
