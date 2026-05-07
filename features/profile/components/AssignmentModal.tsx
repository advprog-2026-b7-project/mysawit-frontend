"use client";

import React, { useState, useEffect } from "react";
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
  isLoading = false,
  onSuccess,
  onError,
}: AssignmentModalProps) {
  const [selectedMandorId, setSelectedMandorId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedMandorId("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !buruh) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const message =
        err instanceof Error ? err.message : "Gagal membuat assignment";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Assign Mandor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">Buruh yang akan di-assign:</p>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-semibold text-gray-800">{buruh.username}</p>
            <p className="text-gray-600 text-sm">{buruh.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Mandor <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMandorId}
              onChange={(e) => setSelectedMandorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- Pilih Mandor --</option>
              {mandors.map((mandor) => (
                <option key={mandor.id} value={mandor.id}>
                  {mandor.username} ({mandor.email})
                </option>
              ))}
            </select>
          </div>

          {selectedMandorId && (
            <div className="bg-green-50 border border-green-300 text-green-800 text-sm p-3 rounded">
              <p className="font-semibold">Mandor yang dipilih:</p>
              <p>
                {mandors.find((m) => m.id === selectedMandorId)?.username}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
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
