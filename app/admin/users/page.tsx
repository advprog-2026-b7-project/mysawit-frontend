"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserList from "@/features/profile/components/UserList";
import { getAllUsersApi } from "@/features/profile/api";
import { useAuth } from "@/features/auth/useAuth";
import type { UserProfile, GetUsersFiltersRequest } from "@/features/profile/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetUsersFiltersRequest>({});

  // Check if user is authenticated and is ADMIN
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/auth/login");
    }
  }, [authUser, authLoading, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllUsersApi(filters);
        // Handle both array and object responses
        const usersList = Array.isArray(data) ? data : data.data || [];
        setUsers(usersList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data pengguna");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

  const handleSelectUser = (user: UserProfile) => {
    router.push(`/profile/${user.id}`);
  };

  const handleFilterChange = (newFilters: GetUsersFiltersRequest) => {
    setFilters(newFilters);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
          >
            ← Kembali ke Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800">
            Manajemen Pengguna
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola dan lihat detail semua pengguna dalam sistem
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Users List */}
        <UserList
          users={users}
          isLoading={isLoading}
          onSelectUser={handleSelectUser}
          onFilterChange={handleFilterChange}
        />

        {/* Stats */}
        {!isLoading && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 font-medium">Total Pengguna</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {users.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 font-medium">Admin</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {users.filter(u => u.role === "ADMIN").length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 font-medium">Mandor</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {users.filter(u => u.role === "MANDOR").length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 font-medium">Buruh</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {users.filter(u => u.role === "BURUH").length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
