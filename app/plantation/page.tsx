"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { plantationClient } from "@/features/plantation/api";
import PlantationList from "@/features/plantation/components/PlantationList";
import PlantationDetail from "@/features/plantation/components/PlantationDetail";
import PlantationForm from "@/features/plantation/components/PlantationForm";
import type {
  PlantationDetailResponse,
  PlantationListFilters,
  PlantationResponse,
} from "@/features/plantation/types";

type View = "list" | "detail" | "create";

export default function PlantationPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>("list");
  const [plantations, setPlantations] = useState<PlantationResponse[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<PlantationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PlantationListFilters>({});

  useEffect(() => {
    if (!authLoading && !authUser) router.push("/auth/login");
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
    if (authUser) fetchList();
  }, [authUser, fetchList]);

  const handleSelectPlantation = async (p: PlantationResponse) => {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!authUser) return null;

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
          <PlantationList
            plantations={plantations}
            isLoading={isLoading}
            onSelect={handleSelectPlantation}
            onFilterChange={(f) => setFilters(f)}
          />
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

