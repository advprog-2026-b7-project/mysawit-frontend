"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileDetail from "@/features/profile/components/ProfileDetail";
import ProfileSkeleton from "@/features/profile/components/ProfileSkeleton";
import { useCurrentUserProfile } from "@/features/profile/useProfile";
import { useAuth } from "@/features/auth/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error } = useCurrentUserProfile();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated
  React.useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/auth/login");
    }
  }, [authUser, authLoading, router]);

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
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Peringatan</h2>
          <p className="text-yellow-700">Profil tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProfileDetail profile={profile} isLoading={isLoading} />
      </div>
    </div>
  );
}
