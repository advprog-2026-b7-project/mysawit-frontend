"use client";

import React, { useState } from "react";
import type { PlantationListFilters, PlantationResponse } from "../types";
import Button from "@/components/ui/Button";

interface PlantationListProps {
  plantations: PlantationResponse[];
  isLoading?: boolean;
  onSelect?: (plantation: PlantationResponse) => void;
  onFilterChange?: (filters: PlantationListFilters) => void;
}

const EMPTY_FILTERS: PlantationListFilters = { name: "", code: "" };

export default function PlantationList({
  plantations,
  isLoading = false,
  onSelect,
  onFilterChange,
}: PlantationListProps) {
  const [filters, setFilters] = useState<PlantationListFilters>(EMPTY_FILTERS);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
    onFilterChange?.({ name: next.name || undefined, code: next.code || undefined });
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    onFilterChange?.({});
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Kebun Sawit</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          name="name"
          placeholder="Cari nama kebun..."
          value={filters.name ?? ""}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          name="code"
          placeholder="Cari kode kebun..."
          value={filters.code ?? ""}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="flex justify-end mb-6">
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
          disabled={!filters.name && !filters.code}
        >
          Reset Filter
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
                    {p.mandor ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {p.mandor.name}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        Belum ada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="primary"
                      onClick={() => onSelect?.(p)}
                      className="px-3 py-1 text-xs"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
