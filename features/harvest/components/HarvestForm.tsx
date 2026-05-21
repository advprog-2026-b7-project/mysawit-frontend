"use client";

import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from "react";
import { harvestClient } from "@/features/harvest/api";
import type { HarvestCreateRequest } from "@/features/harvest/types";

interface HarvestFormProps {
  onSuccess?: (harvestId: string) => void;
}

const inputStyle: CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  border: "1px solid #DBC1B9",
  borderRadius: 12,
  minHeight: 50,
  padding: "14px 16px",
  fontFamily: "'Lato', sans-serif",
  fontWeight: 400,
  fontSize: 16,
  color: "#1B1C1B",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  color: "#52443D",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  marginBottom: 8,
};

const hintStyle: CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 400,
  fontSize: 13,
  color: "#52443D",
  marginTop: 6,
};

const buttonBaseStyle: CSSProperties = {
  borderRadius: 9999,
  padding: "12px 32px",
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

export default function HarvestForm({ onSuccess }: HarvestFormProps) {
  const [formData, setFormData] = useState<HarvestCreateRequest>({
    weightKg: 0,
    notes: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "weightKg" ? (value ? parseFloat(value) : 0) : value,
    }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setFormData({
      weightKg: 0,
      notes: "",
    });
    setPhotos([]);
    setError(null);
    setSuccess(null);
    setPhotoInputKey((key) => key + 1);
  };

  const getFocusStyle = (id: string): CSSProperties =>
    focusedInput === id
      ? { borderColor: "#BB7354", boxShadow: "0 0 0 2px rgba(187,115,84,0.2)" }
      : {};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      if (formData.weightKg <= 0) {
        throw new Error("Weight must be a positive number");
      }
      if (!formData.notes.trim()) {
        throw new Error("Notes are required");
      }
      if (photos.length === 0) {
        throw new Error("At least one harvest photo is required");
      }

      const response = await harvestClient.submitHarvest(
        formData,
        photos
      );

      setSuccess(`Harvest submitted successfully! ID: ${response.id}`);
      setFormData({
        weightKg: 0,
        notes: "",
      });
      setPhotos([]);
      setPhotoInputKey((key) => key + 1);

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
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 50,
            color: "#5B2012",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Submit Harvest
        </h1>
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#52443D",
            margin: "8px 0 0",
          }}
        >
          Report your harvest weight, notes, and photos for verification.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(186,26,26,0.08)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "#BA1A1A",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "rgba(91,32,18,0.06)",
            border: "1px solid rgba(91,32,18,0.15)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "#5B2012",
          }}
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
          padding: 32,
        }}
      >
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#5B2012",
            margin: "0 0 24px",
          }}
        >
          Harvest Details
        </p>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="weightKg" style={labelStyle}>
            Harvest Weight (kg)
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              id="weightKg"
              name="weightKg"
              value={formData.weightKg || ""}
              onChange={handleInputChange}
              onFocus={() => setFocusedInput("weightKg")}
              onBlur={() => setFocusedInput(null)}
              step="0.01"
              min="0"
              placeholder="Enter weight in kilograms"
              required
              style={{ ...inputStyle, ...getFocusStyle("weightKg"), paddingRight: 48 }}
            />
            <span
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#8A4B2F",
              }}
            >
              kg
            </span>
          </div>
          <div style={hintStyle}>Must be a positive number.</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="notes" style={labelStyle}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            onFocus={() => setFocusedInput("notes")}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter harvest notes, location detail, or fruit condition"
            required
            style={{
              ...inputStyle,
              ...getFocusStyle("notes"),
              minHeight: 128,
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
          <div style={hintStyle}>Provide details about the harvest.</div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label htmlFor="photos" style={labelStyle}>
            Upload Photos
          </label>
          <input
            key={photoInputKey}
            type="file"
            id="photos"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            required
            style={{
              ...inputStyle,
              height: "auto",
              padding: "12px 16px",
              color: "#53433D",
            }}
          />
          <div style={hintStyle}>
            Upload at least one JPG, PNG, or WebP photo.
          </div>
          {photos.length > 0 && (
            <div
              style={{
                display: "inline-block",
                background: "#EDE8E4",
                borderRadius: 4,
                padding: "4px 8px",
                marginTop: 8,
                fontFamily: "'Courier New', monospace",
                fontWeight: 400,
                fontSize: 13,
                color: "#5B2012",
              }}
            >
              {photos.length} file(s) selected
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            style={{
              ...buttonBaseStyle,
              background: "#FFFFFF",
              border: "1px solid #DBC1B9",
              color: "#5B2012",
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonBaseStyle,
              background: "#BB7354",
              border: "none",
              color: "#FFFFFF",
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              minWidth: 160,
            }}
          >
            {loading ? "Submitting..." : "Submit Harvest"}
          </button>
        </div>
      </form>
    </div>
  );
}
