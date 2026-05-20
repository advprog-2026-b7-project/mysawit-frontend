"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { plantationClient } from "@/features/plantation/api";
import PlantationDetail from "@/features/plantation/components/PlantationDetail";
import PlantationForm from "@/features/plantation/components/PlantationForm";
import type {
  PlantationDetailResponse,
  PlantationListFilters,
  PlantationListItem,
} from "@/features/plantation/types";

type View = "list" | "detail" | "create";

export default function PlantationPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>("list");
  const [plantations, setPlantations] = useState<PlantationListItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<PlantationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PlantationListFilters>({});

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) { router.push("/auth/login"); return; }
    if (authUser.role !== "ADMIN") { router.push("/dashboard"); }
  }, [authUser, authLoading, router]);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await plantationClient.getAll(filters);
      setPlantations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data kebun");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (authUser && authUser.role === "ADMIN") fetchList();
  }, [authUser, fetchList]);

  const handleSelectPlantation = async (p: PlantationListItem) => {
    try {
      const detail = await plantationClient.getById(p.id);
      setSelectedDetail(detail);
      setView("detail");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail kebun");
    }
  };

  const handleDetailRefresh = async () => {
    if (!selectedDetail) return;
    try {
      const detail = await plantationClient.getById(selectedDetail.id);
      setSelectedDetail(detail);
    } catch {
      // ignore
    }
  };

  if (authLoading || !authUser || authUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-2 text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2 text-sm"
            >
              ← Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-800">Manajemen Kebun Sawit</h1>
          </div>
          {view === "list" && (
            <button
              onClick={() => setView("create")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg transition"
            >
              + Kebun Baru
            </button>
          )}
          {view !== "list" && (
            <button
              onClick={() => { setView("list"); setSelectedDetail(null); fetchList(); }}
              className="text-gray-600 hover:text-gray-800 font-semibold"
            >
              ← Kembali ke Daftar
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {view === "list" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Kebun Sawit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Cari nama kebun..."
                onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value || undefined }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Cari kode kebun..."
                onChange={(e) => setFilters((f) => ({ ...f, code: e.target.value || undefined }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
              </div>
            ) : plantations.length === 0 ? (
              <p className="text-center py-12 text-gray-500">Tidak ada kebun ditemukan</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Nama</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Kode</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Luas (ha)</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Mandor</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {plantations.map((p) => (
                    <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-sm">{p.code}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{p.area}</td>
                      <td className="px-4 py-3 text-center">
                        {p.mandorName ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {p.mandorName}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Belum ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleSelectPlantation(p)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {view === "detail" && selectedDetail && (
          <PlantationDetail
            plantation={selectedDetail}
            onBack={() => { setView("list"); setSelectedDetail(null); fetchList(); }}
            onRefresh={handleDetailRefresh}
          />
        )}

        {view === "create" && (
          <PlantationForm onSuccess={() => { setView("list"); fetchList(); }} />
        )}
      </div>
    </div>
  );
}

