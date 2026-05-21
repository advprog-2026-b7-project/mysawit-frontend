'use client';

import React, { useState, useEffect } from 'react';
import { useWorkerPayroll } from '@/features/payment/hooks';
import { PayrollStats } from '@/features/payment/components';
import { useRouter } from 'next/navigation';

export default function SupirPayrollPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const { payrolls, loading } = useWorkerPayroll(userId);
  const [activeTab, setActiveTab] = useState<'stats' | 'list'>('stats');

  // Get user ID from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    
    if (!storedUserId) {
      router.push('/auth/login');
    } else if (userRole !== 'SUPIR') {
      // Redirect jika bukan supir
      router.push('/dashboard');
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Penggajian Saya</h1>
          <p className="text-blue-100 mt-2">Lihat dan kelola penggajian Anda sebagai Sopir</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>🚗 ID Sopir:</strong> {userId}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Berikut adalah daftar semua penggajian Anda berdasarkan pengiriman yang telah selesai.
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
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Disetujui</p>
                  <p className="text-2xl font-bold text-blue-600">
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
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 text-white">
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
              {!loading && payrolls.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Jumlah</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrolls.map((payroll) => (
                          <tr key={payroll.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm text-gray-800">
                              {payroll.createdAt ? new Date(payroll.createdAt).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-6 py-3 text-sm font-semibold text-gray-800">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(payroll.amount)}
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  payroll.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : payroll.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {payroll.status === 'PENDING'
                                  ? 'Menunggu'
                                  : payroll.status === 'APPROVED'
                                  ? 'Disetujui'
                                  : 'Ditolak'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <button className="text-blue-600 hover:underline">Lihat Detail</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
