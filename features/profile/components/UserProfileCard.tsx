"use client";

import React from "react";
import type { UserProfile } from "../types";

interface UserProfileCardProps {
  profile: UserProfile;
  onViewDetails?: () => void;
}

export default function UserProfileCard({
  profile,
  onViewDetails,
}: UserProfileCardProps) {
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

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "MANDOR":
        return "Mandor";
      case "BURUH":
        return "Buruh";
      case "SUPIR":
        return "Supir";
      default:
        return role;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{profile.username}</h3>
          <p className="text-gray-600 text-sm">{profile.email}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(profile.role)}`}>
          {getRoleName(profile.role)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">User ID:</span>
          <span className="font-mono text-gray-800">{profile.id}</span>
        </div>
        {profile.mandorCertificationNumber && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Certification:</span>
            <span className="font-mono text-gray-800">{profile.mandorCertificationNumber}</span>
          </div>
        )}
        {profile.mandorId && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Supervisor:</span>
            <span className="font-mono text-gray-800 text-xs">{profile.mandorId}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4 mt-4 flex justify-between items-center text-xs text-gray-500">
        <div>
          <p>Created: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}</p>
          <p>Updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "-"}</p>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            View Details →
          </button>
        )}
      </div>
    </div>
  );
}
