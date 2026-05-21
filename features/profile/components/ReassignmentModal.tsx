"use client";

import React, { useEffect, useState } from "react";
import type { AssignmentResponse, UserProfile } from "../types";
import { reassignmentApi } from "../api";
import Button from "@/components/ui/Button";

interface ReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentResponse | null;
  mandors: UserProfile[];
  isLoading?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function ReassignmentModal({
  isOpen,
  onClose,
  assignment,
  mandors,
  onSuccess,
  onError,
}: ReassignmentModalProps) {
  const [selectedMandorId, setSelectedMandorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && assignment) {
      setSelectedMandorId("");
      setError(null);
    }
  }, [isOpen, assignment]);

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedMandorId) {
      setError("Pilih Mandor baru terlebih dahulu");
      return;
    }

    if (selectedMandorId === assignment.mandorId) {
      setError("Pilih Mandor yang berbeda dari Mandor sekarang");
      return;
    }

    setLoading(true);
    try {
      await reassignmentApi(assignment.id, {
        newMandorId: selectedMandorId,
      });

      setSelectedMandorId("");
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal melakukan reassignment";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const newMandor = mandors.find((mandor) => mandor.id === selectedMandorId);

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
            Reassign Mandor
          </h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none" style={{ color: "#854E31" }}>
            x
          </button>
        </div>

        <div className="mb-4 space-y-4">
          <div>
            <p className="mb-2 text-sm" style={{ color: "#52443D" }}>Buruh:</p>
            <div className="rounded-lg p-3" style={{ background: "#EDE8E4" }}>
              <p className="font-semibold" style={{ color: "#1B1C1B" }}>
                {assignment.buruhName || assignment.buruhNama || assignment.buruhId}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm" style={{ color: "#52443D" }}>Mandor sekarang:</p>
            <div className="rounded-lg p-3" style={{ background: "rgba(91,32,18,0.06)", border: "1px solid rgba(91,32,18,0.15)" }}>
              <p className="font-semibold" style={{ color: "#5B2012" }}>
                {assignment.mandorName || assignment.mandorNama || assignment.mandorId}
              </p>
            </div>
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
              Pilih Mandor Baru <span style={{ color: "#BA1A1A" }}>*</span>
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
              <option value="">-- Pilih Mandor Baru --</option>
              {mandors
                .filter((mandor) => mandor.id !== assignment.mandorId)
                .map((mandor) => (
                  <option key={mandor.id} value={mandor.id}>
                    {mandor.nama || mandor.username} ({mandor.email})
                  </option>
                ))}
            </select>
          </div>

          {newMandor && (
            <div
              className="rounded p-3 text-sm"
              style={{
                background: "rgba(91,32,18,0.06)",
                border: "1px solid rgba(91,32,18,0.15)",
                color: "#5B2012",
              }}
            >
              <p className="font-semibold">Mandor baru yang dipilih:</p>
              <p>{newMandor.nama || newMandor.username}</p>
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
              {loading ? "Menyimpan..." : "Reassign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
