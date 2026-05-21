'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MandorPayrollPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'team'>('overview');

  // Get user ID from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    
    if (!storedUserId) {
      router.push('/auth/login');
    } else if (userRole !== 'MANDOR') {
      // Redirect jika bukan mandor
      router.push('/dashboard');
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Penggajian Tim</h1>
          <p className="text-orange-100 mt-2">Kelola penggajian tim Anda</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-800">
            <strong>👔 ID Mandor:</strong> {userId}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Kelola penggajian dan daftar upah tim Anda di sini.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Ikhtisar
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'team'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            👥 Tim Saya
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                  <p className="text-sm text-gray-600">Total Anggota Tim</p>
                  <p className="text-2xl font-bold text-gray-800">-</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-600">Penggajian Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">-</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                  <p className="text-sm text-gray-600">Penggajian Disetujui</p>
                  <p className="text-2xl font-bold text-orange-600">-</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                  <p className="text-sm text-gray-600">Penggajian Ditolak</p>
                  <p className="text-2xl font-bold text-red-600">-</p>
                </div>
              </div>

              {/* Placeholder Message */}
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 text-lg">Fitur penggajian tim sedang dalam pengembangan</p>
                <p className="text-gray-500 text-sm mt-2">Data akan ditampilkan segera</p>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg">Fitur manajemen tim sedang dalam pengembangan</p>
              <p className="text-gray-500 text-sm mt-2">Data tim Anda akan ditampilkan segera</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
