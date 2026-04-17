"use client";

import React, { useState } from "react";
import type { UserProfile } from "../types";
import Button from "@/components/ui/Button";

interface UserListProps {
  users: UserProfile[];
  isLoading?: boolean;
  onSelectUser?: (user: UserProfile) => void;
  onFilterChange?: (filters: any) => void;
}

export default function UserList({
  users,
  isLoading = false,
  onSelectUser,
  onFilterChange,
}: UserListProps) {
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    role: "",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
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
      <div className="grid grid-cols-3 gap-4 mb-6">
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
                    <Button
                      variant="primary"
                      onClick={() => onSelectUser?.(user)}
                      className="px-3 py-1 text-xs"
                    >
                      Lihat Detail
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
