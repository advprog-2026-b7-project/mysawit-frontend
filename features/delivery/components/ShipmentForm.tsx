"use client";

import { useEffect, useState } from "react";
import { deliveryApi } from "@/features/delivery/api";
import { deliveryApiClient } from "@/features/delivery/deliveryApi";
import type { DriverItem } from "@/features/delivery/deliveryTypes";
import styles from "./ShipmentForm.module.css";

interface ShipmentFormProps {
    onSuccess?: (shipmentId: string) => void;
}

export default function ShipmentForm({ onSuccess }: ShipmentFormProps) {
    const [harvestIds, setHarvestIds] = useState("");
    const [driverId, setDriverId] = useState("");
    const [plantationId, setPlantationId] = useState<string | null>(null);
    const [drivers, setDrivers] = useState<DriverItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        deliveryApiClient.getMyPlantationId()
            .then((pid) => {
                setPlantationId(pid);
                return deliveryApiClient.getAvailableDrivers(pid);
            })
            .then(setDrivers)
            .catch(() => undefined);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const ids = harvestIds.split(",").map((s) => s.trim()).filter(Boolean);
            if (ids.length === 0) throw new Error("At least one harvest ID is required");
            if (!driverId) throw new Error("Driver is required");

            const response = await deliveryApi.createShipment({
                harvestIds: ids,
                driverId,
            });
            setSuccess(`Shipment created! ID: ${response.id}`);
            setHarvestIds("");
            setDriverId("");
            if (onSuccess) onSuccess(response.id);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(errorMessage);
            console.error("Error creating shipment:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Shipment Registration</h1>
            <p className={styles.subtitle}>Register new delivery shipment data</p>

            {plantationId && (
                <p className={styles.subtitle}>Plantation: {plantationId}</p>
            )}

            {error && <div className={`${styles.alert} ${styles.alertError}`}><strong>Error!</strong> {error}</div>}
            {success && <div className={`${styles.alert} ${styles.alertSuccess}`}><strong>Success!</strong> {success}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="harvestIds">Harvest IDs (comma separated) <span className={styles.required}>*</span></label>
                    <input type="text" id="harvestIds" name="harvestIds" value={harvestIds} onChange={(e) => setHarvestIds(e.target.value)} placeholder="e.g. uuid-1, uuid-2" required />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="driverId">Driver <span className={styles.required}>*</span></label>
                    <select id="driverId" name="driverId" value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
                        <option value="">Select a driver</option>
                        {drivers.map((d) => (
                            <option key={d.id} value={d.id}>{d.name || d.id}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.btnSubmit} disabled={loading}>
                        {loading ? "Submitting..." : "Create Shipment"}
                    </button>
                </div>
            </form>
        </div>
    );
}