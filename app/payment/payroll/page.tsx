'use client';

import React, { useState, useEffect } from 'react';
import { useWorkerPayroll } from '@/features/payment/hooks';
import { PayrollList, PayrollStats } from '@/features/payment/components';
import { useRouter } from 'next/navigation';

export default function WorkerPayrollPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const { payrolls, loading } = useWorkerPayroll(userId);
  const [activeTab, setActiveTab] = useState<'stats' | 'list'>('stats');

  // Get user ID from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (!storedUserId) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Daftar Penggajian Saya</h1>
          <p className="text-blue-100 mt-2">Lihat dan kelola penggajian Anda</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>👤 ID Pekerja:</strong> {userId}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Berikut adalah daftar semua penggajian Anda. Anda dapat melihat detail dan status setiap penggajian.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📋 Daftar Penggajian
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Total Penggajian</p>
                  <p className="text-2xl font-bold text-gray-800">{payrolls.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {payrolls.filter((p) => p.status === 'PENDING').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">Disetujui</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payrolls.filter((p) => p.status === 'APPROVED').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                  <p className="text-sm text-gray-600">Ditolak</p>
                  <p className="text-2xl font-bold text-red-600">
                    {payrolls.filter((p) => p.status === 'REJECTED').length}
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Pendapatan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-4 text-white">
                    <p className="text-sm opacity-90">Total Semua Penggajian</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(payrolls.reduce((sum, p) => sum + p.amount, 0))}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-4 text-white">
                    <p className="text-sm opacity-90">Menunggu Persetujuan</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(
                        payrolls
                          .filter((p) => p.status === 'PENDING')
                          .reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 text-white">
                    <p className="text-sm opacity-90">Sudah Disetujui</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(
                        payrolls
                          .filter((p) => p.status === 'APPROVED')
                          .reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Analisis Status</h3>
                <PayrollStats payrolls={payrolls} isLoading={loading} />
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div>
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              )}
              {!loading && payrolls.length === 0 && (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <p className="text-gray-500 text-lg">Belum ada data penggajian</p>
                </div>
              )}
              {!loading && payrolls.length > 0 && <PayrollList isAdmin={false} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
