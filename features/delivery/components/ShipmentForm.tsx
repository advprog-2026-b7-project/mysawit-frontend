"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import { deliveryApi } from "@/features/delivery/api";
import styles from "./ShipmentForm.module.css";
import type { CreateShipmentRequest, Shipment } from "@/features/delivery/types";

interface ShipmentFormProps {
    onSuccess?: (shipment: Shipment) => void;
}

export default function ShipmentForm({ onSuccess }: ShipmentFormProps) {
    const { user } = useAuth();

    const [formData, setFormData] = useState<CreateShipmentRequest>({
        plantationId: "",
        mandorId: "",
        totalWeightKg: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Set mandorId otomatis dari user yang login
    useEffect(() => {
        if (user?.sub) {
            setFormData(prev => ({ ...prev, mandorId: user.sub }));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!formData.plantationId) {
                throw new Error("Plantation ID is required");
            }
            if (!formData.mandorId) {
                throw new Error("Mandor ID is required");
            }
            if (formData.totalWeightKg <= 0) {
                throw new Error("Weight must be greater than 0");
            }

            const response = await deliveryApi.createShipment(formData);
            setSuccess(`Shipment berhasil dibuat! ID: ${response.id}`);
            setFormData({
                plantationId: "",
                mandorId: user?.sub ?? "",
                totalWeightKg: 0,
            });
            if (onSuccess) onSuccess(response);
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "An unexpected error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Shipment Registration</h1>
            <p className={styles.subtitle}>Register new delivery shipment data</p>

            {error && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                    <strong>Error!</strong> {error}
                </div>
            )}
            {success && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                    <strong>Success!</strong> {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="plantationId">
                        Plantation ID <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="plantationId"
                        name="plantationId"
                        value={formData.plantationId}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            plantationId: e.target.value
                        }))}
                        placeholder="UUID plantation"
                        required
                    />
                </div>

                {/* Mandor ID tidak ditampilkan, otomatis dari user login */}

                <div className={styles.formGroup}>
                    <label htmlFor="totalWeightKg">
                        Total Weight (kg) <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="number"
                        id="totalWeightKg"
                        name="totalWeightKg"
                        value={formData.totalWeightKg || ""}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            totalWeightKg: e.target.value ? Number(e.target.value) : 0
                        }))}
                        min="0"
                        max="400"
                        step="0.01"
                        required
                    />
                    <div className={styles.hint}>Max 400kg allowed</div>
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        type="submit"
                        className={styles.btnSubmit}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Create Shipment"}
                    </button>
                </div>
            </form>
        </div>
    );
}