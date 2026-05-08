"use client";

import { useState } from "react";
import { deliveryApi } from "@/features/delivery/api";
import type { Shipment } from "@/features/delivery/types";

interface Props {
    shipment: Shipment;
    onStatusUpdated?: (updated: Shipment) => void;
}

const NEXT_STATUS: Record<string, string | null> = {
    MEMUAT: "MENGIRIM",
    MENGIRIM: "TIBA_DI_TUJUAN",
    TIBA_DI_TUJUAN: null,
};

const LABEL: Record<string, string> = {
    MENGIRIM: "Mulai Kirim",
    TIBA_DI_TUJUAN: "Tiba di Tujuan",
};

export default function ShipmentStatusButton({ shipment, onStatusUpdated }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nextStatus = NEXT_STATUS[shipment.status] ?? null;

    if (!nextStatus) return null; // Tidak tampilkan button jika sudah final

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        try {
            const updated = await deliveryApi.updateStatus(shipment.id, nextStatus);
            if (onStatusUpdated) onStatusUpdated(updated);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleClick}
                disabled={loading}
                style={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    fontWeight: "bold",
                }}
            >
                {loading ? "Memproses..." : LABEL[nextStatus]}
            </button>
            {error && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                    {error}
                </p>
            )}
        </div>
    );
}