"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { AssignmentList } from "@/features/profile";
import AssignmentModal from "@/features/profile/components/AssignmentModal";
import { getUsersByRoleApi } from "@/features/profile/api";
import Button from "@/components/ui/Button";
import type { UserProfile } from "@/features/profile/types";

export default function AdminAssignmentsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [buruhList, setBuruhList] = useState<UserProfile[]>([]);
  const [mandorList, setMandorList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedBuruh, setSelectedBuruh] = useState<UserProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if user is authenticated and is ADMIN
  useEffect(() => {
    if (!authLoading && (!authUser || authUser.role !== "ADMIN")) {
      router.push("/dashboard");
    }
  }, [authUser, authLoading, router]);

  // Load Buruh and Mandor users
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const [buruh, mandor] = await Promise.all([
          getUsersByRoleApi("BURUH"),
          getUsersByRoleApi("MANDOR"),
        ]);
        setBuruhList(Array.isArray(buruh) ? buruh : buruh.data || []);
        setMandorList(Array.isArray(mandor) ? mandor : mandor.data || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat data pengguna";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleOpenAssignmentModal = (buruh: UserProfile) => {
    setSelectedBuruh(buruh);
    setShowAssignmentModal(true);
  };

  const handleAssignmentSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
          <Button variant="primary" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buruh Selection Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Pilih Buruh untuk Assign
            </h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : buruhList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada Buruh ditemukan</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {buruhList.map((buruh) => (
                  <button
                    key={buruh.id}
                    onClick={() => handleOpenAssignmentModal(buruh)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-colors"
                  >
                    <p className="font-semibold text-gray-800">{buruh.username}</p>
                    <p className="text-sm text-gray-600">{buruh.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assignment List */}
          <div className="lg:col-span-2">
            <AssignmentList
              key={refreshKey}
              onRefresh={handleAssignmentSuccess}
              isLoading={loading}
            />
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedBuruh(null);
        }}
        buruh={selectedBuruh}
        mandors={mandorList}
        isLoading={loading}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
