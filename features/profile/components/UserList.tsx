"use client";

import React, { useState } from "react";
import type { GetUsersFiltersRequest, UserProfile } from "../types";
import Button from "@/components/ui/Button";

interface UserListProps {
  users: UserProfile[];
  isLoading?: boolean;
  onSelectUser?: (user: UserProfile) => void;
  onFilterChange?: (filters: GetUsersFiltersRequest) => void;
  onDeleteUser?: (user: UserProfile) => void;
  currentUserId?: string;
}

type UserFiltersForm = {
  name: string;
  email: string;
  role: "" | UserProfile["role"];
};

const EMPTY_FILTERS: UserFiltersForm = {
  name: "",
  email: "",
  role: "",
};

const normalizeFilters = (filters: UserFiltersForm): GetUsersFiltersRequest => {
  const name = filters.name.trim();
  const email = filters.email.trim();

  return {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(filters.role ? { role: filters.role } : {}),
  };
};

export default function UserList({
  users,
  isLoading = false,
  onSelectUser,
  onFilterChange,
  onDeleteUser,
  currentUserId,
}: UserListProps) {
  const [filters, setFilters] = useState<UserFiltersForm>(EMPTY_FILTERS);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserProfile | null>(null);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value } as UserFiltersForm;
    setFilters(newFilters);
    onFilterChange?.(normalizeFilters(newFilters));
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    onFilterChange?.({});
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANDOR":
        return "bg-blue-100 text-blue-800";
      case "BURUH":
        return "bg-green-100 text-green-800";
      case "SUPIR":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Pengguna</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
        <input
          type="text"
          name="name"
          placeholder="Cari nama..."
          value={filters.name}
          onChange={handleFilterChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Cari email..."
          value={filters.email}
          onChange={handleFilterChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="MANDOR">Mandor</option>
          <option value="BURUH">Buruh</option>
          <option value="SUPIR">Supir</option>
        </select>
      </div>
      <div className="flex items-center justify-end mb-6">
        <Button
          type="button"
          variant="secondary"
          onClick={handleResetFilters}
          disabled={!filters.name && !filters.email && !filters.role}
        >
          Reset Filter
        </Button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Role</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{user.username}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="primary"
                        onClick={() => onSelectUser?.(user)}
                        className="px-3 py-1 text-xs"
                      >
                        Lihat Detail
                      </Button>
                      {user.id !== currentUserId && (
                        <Button
                          variant="secondary"
                          onClick={() => setConfirmDeleteUser(user)}
                          className="px-3 py-1 text-xs !bg-red-100 !text-red-700 hover:!bg-red-200 border-red-300"
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pengguna</h3>
            <p className="text-gray-600 mb-6">
              Yakin ingin menghapus pengguna{" "}
              <span className="font-semibold text-gray-900">{confirmDeleteUser.username}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1"
              >
                Batal
              </Button>
              <button
                onClick={() => {
                  onDeleteUser?.(confirmDeleteUser);
                  setConfirmDeleteUser(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
