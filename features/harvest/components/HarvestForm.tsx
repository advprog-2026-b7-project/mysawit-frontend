"use client";

import { useState } from "react";
import { harvestClient } from "@/features/harvest/api";
import type { HarvestCreateRequest } from "@/features/harvest/types";
import styles from "./HarvestForm.module.css";

interface HarvestFormProps {
  onSuccess?: (harvestId: string) => void;
}

export default function HarvestForm({ onSuccess }: HarvestFormProps) {
  const [formData, setFormData] = useState<HarvestCreateRequest>({
    plantationId: "",
    buruhId: "",
    weightKg: 0,
    description: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
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
        name === "weightKg" ? (value ? parseFloat(value) : 0) : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      if (!formData.plantationId.trim()) {
        throw new Error("Plantation ID is required");
      }
      if (!formData.buruhId.trim()) {
        throw new Error("Buruh ID is required");
      }
      if (formData.weightKg <= 0) {
        throw new Error("Weight must be a positive number");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }

      const response = await harvestClient.submitHarvest(
        formData,
        photos.length > 0 ? photos : undefined
      );

      setSuccess(`Harvest submitted successfully! ID: ${response.id}`);
      setFormData({
        plantationId: "",
        buruhId: "",
        weightKg: 0,
        description: "",
      });
      setPhotos([]);

      if (onSuccess) {
        onSuccess(response.id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error submitting harvest:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Harvest Submission</h1>
      <p className={styles.subtitle}>
        Submit your harvest data and upload photos for verification
      </p>

      {error && (
        <div className={styles.alert + " " + styles.alertError}>
          <strong>Error!</strong> {error}
          <div className={styles.hint}>
            <p>
              <strong>Troubleshooting:</strong>
            </p>
            <ul>
              <li>Make sure the backend service is running</li>
              <li>Check your internet connection</li>
              <li>Reload page and try again</li>
              <li>Verify all form fields are filled correctly</li>
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
          <label htmlFor="plantationId">
            Plantation ID <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="plantationId"
            name="plantationId"
            value={formData.plantationId}
            onChange={handleInputChange}
            placeholder="Enter plantation UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="buruhId">
            Worker ID (Buruh) <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="buruhId"
            name="buruhId"
            value={formData.buruhId}
            onChange={handleInputChange}
            placeholder="Enter worker UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="weightKg">
            Harvest Weight (kg) <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            id="weightKg"
            name="weightKg"
            value={formData.weightKg || ""}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="Enter weight in kilograms"
            required
          />
          <div className={styles.hint}>Must be a positive number</div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">
            Description <span className={styles.required}>*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter harvest description (e.g., condition, location, notes)"
            required
          />
          <div className={styles.hint}>Provide details about the harvest</div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="photos">Upload Photos (Optional)</label>
          <input
            type="file"
            id="photos"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <div className={styles.hint}>
            You can upload one or more photos. Supported formats: JPG, PNG, GIF, etc.
          </div>
          {photos.length > 0 && (
            <div className={styles.photoCount}>
              {photos.length} file(s) selected
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Harvest"}
          </button>
          <button
            type="reset"
            className={styles.btnReset}
            onClick={() => setPhotos([])}
            disabled={loading}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}
