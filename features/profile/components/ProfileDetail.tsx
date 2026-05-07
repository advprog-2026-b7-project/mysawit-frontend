"use client";

import React from "react";
import type { UserProfile } from "../types";

interface ProfileDetailProps {
  profile: UserProfile;
  isLoading?: boolean;
  onBack?: () => void;
}

export default function ProfileDetail({
  profile,
  isLoading = false,
  onBack,
}: ProfileDetailProps) {
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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator - Dapat mengelola semua pengguna dan data sistem";
      case "MANDOR":
        return "Mandor - Memimpin dan mengawasi tim buruh di lapangan";
      case "BURUH":
        return "Buruh - Menjalankan pekerjaan di lapangan";
      case "SUPIR":
        return "Supir - Mengemudi dan transportasi";
      default:
        return role;
    }
  };

  const renderRoleSpecificInfo = () => {
    switch (profile.role) {
      case "MANDOR":
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Informasi Mandor</h4>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-blue-700 font-medium">Nomor Sertifikasi</label>
                <p className="text-blue-900 font-mono">
                  {profile.mandorCertificationNumber || "Belum ada sertifikasi"}
                </p>
              </div>
            </div>
          </div>
        );

      case "BURUH":
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Informasi Buruh</h4>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-green-700 font-medium">Supervisor Mandor</label>
                <p className="text-green-900 font-mono text-sm">
                  {profile.mandorId || "Belum ditugaskan"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
          >
            ← Kembali
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          Detail Profil
        </h1>
        <div className="w-24" />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Dasar
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 font-medium">Nama</label>
                <p className="text-lg text-gray-900 font-semibold">{profile.username}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Email</label>
                <p className="text-lg text-gray-900 font-mono">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">User ID</label>
                <p className="text-lg text-gray-900 font-mono">{profile.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Role</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getRoleColor(profile.role)}`}>
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700">{getRoleDescription(profile.role)}</p>
          </div>

          {/* Role Specific Information */}
          {renderRoleSpecificInfo()}

          {/* Timestamps */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Riwayat
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 font-medium">Dibuat pada</label>
                <p className="text-gray-900">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleString("id-ID") : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Diperbarui pada</label>
                <p className="text-gray-900">
                  {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString("id-ID") : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
