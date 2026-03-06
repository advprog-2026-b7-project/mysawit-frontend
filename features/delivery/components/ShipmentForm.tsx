"use client";

import { useState } from "react";
import { deliveryApi } from "@/features/delivery/api";
import type { CreateShipmentRequest } from "@/features/delivery/types";
import styles from "./ShipmentForm.module.css";

interface ShipmentFormProps {
    onSuccess?: (shipmentId: string) => void;
}

const initialFormState: CreateShipmentRequest = {
    plantationId: "",
    mandorId: "",
    totalWeightKg: 0,
};

export default function ShipmentForm({ onSuccess }: ShipmentFormProps) {
    const [formData, setFormData] = useState<CreateShipmentRequest>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "totalWeightKg" ? (value ? Number(value) : 0) : value,
        }));
    };

    const resetForm = () => setFormData(initialFormState);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!formData.plantationId) throw new Error("Plantation ID is required");
            if (!formData.mandorId) throw new Error("Mandor ID is required");
            if (formData.totalWeightKg <= 0) throw new Error("Weight must be greater than 0");

            const response = await deliveryApi.createShipment(formData);
            setSuccess(`Shipment created! ID: ${response.id}`);
            resetForm();
            if (onSuccess) onSuccess(response.id);
        } catch (err: any) {
            setError(err.message || "Failed to create shipment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Shipment Registration</h1>
            <p className={styles.subtitle}>Register new delivery shipment data</p>

            {error && <div className={`${styles.alert} ${styles.alertError}`}><strong>Error!</strong> {error}</div>}
            {success && <div className={`${styles.alert} ${styles.alertSuccess}`}><strong>Success!</strong> {success}</div>}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="plantationId">Plantation ID <span className={styles.required}>*</span></label>
                    <input type="text" id="plantationId" name="plantationId" value={formData.plantationId} onChange={handleInputChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="mandorId">Mandor ID <span className={styles.required}>*</span></label>
                    <input type="text" id="mandorId" name="mandorId" value={formData.mandorId} onChange={handleInputChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="totalWeightKg">Total Weight (kg) <span className={styles.required}>*</span></label>
                    <input type="number" id="totalWeightKg" name="totalWeightKg" value={formData.totalWeightKg || ""} onChange={handleInputChange} min="0" step="0.01" required />
                    <div className={styles.hint}>Max 400kg allowed</div>
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