"use client";

import React, { useState } from "react";
import type { PlantationDetailResponse } from "../types";
import { plantationClient } from "../api";
import Button from "@/components/ui/Button";

interface Props {
  plantation: PlantationDetailResponse;
  onBack: () => void;
  onRefresh: () => void;
}

export default function PlantationDetail({ plantation, onBack, onRefresh }: Props) {
  const [mandorId, setMandorId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const wrap = async (fn: () => Promise<void>) => {
    setError(null);
    setLoading(true);
    try {
      await fn();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMandor = () =>
    wrap(async () => {
      if (!mandorId.trim()) throw new Error("Masukkan ID Mandor");
      await plantationClient.assignMandor(plantation.id, { mandorId: mandorId.trim() });
      setMandorId("");
    });

  const handleUnassignMandor = () =>
    wrap(() => plantationClient.unassignMandor(plantation.id));

  const handleAssignDriver = () =>
    wrap(async () => {
      if (!driverId.trim()) throw new Error("Masukkan ID Supir");
      await plantationClient.assignDriver(plantation.id, { driverId: driverId.trim() });
      setDriverId("");
    });

  const handleUnassignDriver = (id: string) =>
    wrap(() => plantationClient.unassignDriver(plantation.id, id));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-semibold">
          ← Kembali
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Detail Kebun</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Nama</span>
          <p className="font-semibold text-gray-900">{plantation.name}</p>
        </div>
        <div>
          <span className="text-gray-500">Kode</span>
          <p className="font-mono font-semibold text-gray-900">{plantation.code}</p>
        </div>
        <div>
          <span className="text-gray-500">Luas</span>
          <p className="font-semibold text-gray-900">{plantation.area} ha</p>
        </div>
        <div>
          <span className="text-gray-500">Koordinat</span>
          <p className="font-mono text-xs text-gray-700">
            {plantation.coordinates.map((c) => `(${c[0]},${c[1]})`).join(" → ")}
          </p>
        </div>
      </div>

      {/* Mandor */}
      <div className="border rounded-lg p-4">
        <h3 className="font-bold text-gray-800 mb-3">Mandor</h3>
        {plantation.mandor ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{plantation.mandor.name}</p>
              {plantation.mandor.certificationNumber && (
                <p className="text-xs text-gray-500">Sertifikasi: {plantation.mandor.certificationNumber}</p>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={handleUnassignMandor}
              disabled={loading}
              className="!text-red-600 !border-red-300 hover:!bg-red-50 text-xs px-3 py-1"
            >
              Copot
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={mandorId}
              onChange={(e) => setMandorId(e.target.value)}
              placeholder="UUID Mandor"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <Button variant="primary" onClick={handleAssignMandor} disabled={loading} className="text-xs px-3 py-2">
              Tugaskan
            </Button>
          </div>
        )}
      </div>

      {/* Drivers */}
      <div className="border rounded-lg p-4">
        <h3 className="font-bold text-gray-800 mb-3">Supir Truk</h3>

        {plantation.drivers.length === 0 ? (
          <p className="text-gray-500 text-sm mb-3">Belum ada supir ditugaskan</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {plantation.drivers.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">{d.name}</span>
                <Button
                  variant="secondary"
                  onClick={() => handleUnassignDriver(d.id)}
                  disabled={loading}
                  className="!text-red-600 !border-red-300 hover:!bg-red-50 text-xs px-2 py-1"
                >
                  Copot
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="UUID Supir"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Button variant="primary" onClick={handleAssignDriver} disabled={loading} className="text-xs px-3 py-2">
            Tugaskan
          </Button>
        </div>
      </div>
    </div>
  );
}
