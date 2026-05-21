"use client";

import React, { useEffect, useState } from "react";
import type { UserProfile } from "../types";
import { createAssignmentApi } from "../api";
import Button from "@/components/ui/Button";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  buruh: UserProfile | null;
  mandors: UserProfile[];
  isLoading?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function AssignmentModal({
  isOpen,
  onClose,
  buruh,
  mandors,
  onSuccess,
  onError,
}: AssignmentModalProps) {
  const [selectedMandorId, setSelectedMandorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedMandorId("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !buruh) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedMandorId) {
      setError("Pilih Mandor terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      await createAssignmentApi({
        buruhId: buruh.id,
        mandorId: selectedMandorId,
      });

      setSelectedMandorId("");
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat assignment";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMandor = mandors.find((mandor) => mandor.id === selectedMandorId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(27,28,27,0.35)" }}
    >
      <div
        className="mx-4 w-full max-w-md p-6"
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 16, color: "#5B2012" }}>
            Assign Mandor
          </h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none" style={{ color: "#854E31" }}>
            x
          </button>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm" style={{ color: "#52443D" }}>
            Buruh yang akan di-assign:
          </p>
          <div className="rounded-lg p-3" style={{ background: "#EDE8E4" }}>
            <p className="font-semibold" style={{ color: "#1B1C1B" }}>
              {buruh.nama || buruh.username}
            </p>
            <p className="text-sm" style={{ color: "#52443D" }}>
              {buruh.email}
            </p>
          </div>
        </div>

        {error && (
          <div
            className="mb-4 text-sm"
            style={{
              background: "rgba(186,26,26,0.08)",
              border: "1px solid rgba(186,26,26,0.2)",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#BA1A1A",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: "#52443D" }}>
              Pilih Mandor <span style={{ color: "#BA1A1A" }}>*</span>
            </label>
            <select
              value={selectedMandorId}
              onChange={(event) => setSelectedMandorId(event.target.value)}
              className="w-full focus:outline-none"
              style={{
                height: 50,
                background: "#FFFFFF",
                border: "1px solid #DBC1B9",
                borderRadius: 12,
                padding: "0 16px",
                color: "#1B1C1B",
              }}
              required
            >
              <option value="">-- Pilih Mandor --</option>
              {mandors.map((mandor) => (
                <option key={mandor.id} value={mandor.id}>
                  {mandor.nama || mandor.username} ({mandor.email})
                </option>
              ))}
            </select>
          </div>

          {selectedMandor && (
            <div
              className="rounded p-3 text-sm"
              style={{
                background: "rgba(91,32,18,0.06)",
                border: "1px solid rgba(91,32,18,0.15)",
                color: "#5B2012",
              }}
            >
              <p className="font-semibold">Mandor yang dipilih:</p>
              <p>{selectedMandor.nama || selectedMandor.username}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !selectedMandorId}
              loading={loading}
              className="flex-1"
            >
              {loading ? "Menyimpan..." : "Assign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
