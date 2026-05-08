"use client";

import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
      {/* Header Skeleton */}
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>

      {/* Section 1 */}
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
      </div>

      {/* Section 3 */}
      <div className="border-t pt-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
