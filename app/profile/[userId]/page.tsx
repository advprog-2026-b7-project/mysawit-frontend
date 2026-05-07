"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProfileDetail from "@/features/profile/components/ProfileDetail";
import ProfileSkeleton from "@/features/profile/components/ProfileSkeleton";
import { useUserProfile } from "@/features/profile/useProfile";
import { useAuth } from "@/features/auth/useAuth";

export default function AdminUserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  
  const { user: authUser, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error } = useUserProfile(userId);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated and is ADMIN
  React.useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/auth/login");
    }
  }, [authUser, authLoading, router]);

  const handleBack = () => {
    router.back();
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
          >
            ← Kembali
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
          >
            ← Kembali
          </button>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Peringatan</h2>
            <p className="text-yellow-700">Profil pengguna tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProfileDetail
          profile={profile}
          isLoading={isLoading}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
