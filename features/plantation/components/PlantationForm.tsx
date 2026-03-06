"use client";

import { useState } from "react";
import { plantationClient } from "@/features/plantation/api";
import type { PlantationCreateRequest } from "@/features/plantation/types";
import styles from "./PlantationForm.module.css";

interface PlantationFormProps {
  onSuccess?: (plantationId: string) => void;
}

const initialFormState: PlantationCreateRequest = {
  code: "",
  name: "",
  location: "",
  areaHectares: 0,
  treeCount: 0,
  managerName: "",
  notes: "",
};

export default function PlantationForm({ onSuccess }: PlantationFormProps) {
  const [formData, setFormData] = useState<PlantationCreateRequest>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "areaHectares" || name === "treeCount"
          ? (value ? Number(value) : 0)
          : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.code.trim()) {
        throw new Error("Plantation code is required");
      }
      if (!formData.name.trim()) {
        throw new Error("Plantation name is required");
      }
      if (!formData.location.trim()) {
        throw new Error("Location is required");
      }
      if (formData.areaHectares <= 0) {
        throw new Error("Area must be a positive number");
      }
      if (formData.treeCount < 0) {
        throw new Error("Tree count cannot be negative");
      }

      const response = await plantationClient.createPlantation(formData);
      const createdId = response.id || "(ID unavailable)";

      setSuccess(`Plantation created successfully! ID: ${createdId}`);
      resetForm();

      if (onSuccess && response.id) {
        onSuccess(response.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Error creating plantation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Plantation Registration</h1>
      <p className={styles.subtitle}>
        Register plantation data so it can be used by other modules
      </p>

      {error && (
        <div className={styles.alert + " " + styles.alertError}>
          <strong>Error!</strong> {error}
          <div className={styles.hint}>
            <p>
              <strong>Troubleshooting:</strong>
            </p>
            <ul>
              <li>Make sure the plantation backend service is running</li>
              <li>Check your internet connection</li>
              <li>Reload page and try again</li>
              <li>Verify all required form fields are filled correctly</li>
            </ul>
          </div>
        </div>
      )}

      {success && (
        <div className={styles.alert + " " + styles.alertSuccess}>
          <strong>Success!</strong> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="code">
            Plantation Code <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="Enter plantation code (e.g., PLANT-001)"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">
            Plantation Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter plantation name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">
            Location <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter plantation location"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="areaHectares">
            Area (hectares) <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            id="areaHectares"
            name="areaHectares"
            value={formData.areaHectares || ""}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            placeholder="Enter plantation area in hectares"
            required
          />
          <div className={styles.hint}>Must be a positive number</div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="treeCount">Total Trees</label>
          <input
            type="number"
            id="treeCount"
            name="treeCount"
            value={formData.treeCount || ""}
            onChange={handleInputChange}
            min="0"
            step="1"
            placeholder="Enter total number of trees"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="managerName">Manager Name</label>
          <input
            type="text"
            id="managerName"
            name="managerName"
            value={formData.managerName || ""}
            onChange={handleInputChange}
            placeholder="Enter manager name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleInputChange}
            placeholder="Add optional notes about this plantation"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Create Plantation"}
          </button>
          <button
            type="reset"
            className={styles.btnReset}
            onClick={resetForm}
            disabled={loading}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}
