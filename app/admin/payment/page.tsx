'use client';

import React, { useState } from 'react';
import { usePayment } from '@/features/payment/hooks';
import {
  PayrollList,
  PayrollStats,
  WageVariablesForm,
  WalletWidget,
} from '@/features/payment/components';

export default function AdminPaymentPage() {
  const { approve, reject } = usePayment();
  const [activeTab, setActiveTab] = useState<'overview' | 'payroll' | 'settings' | 'wallet'>(
    'overview'
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const handleApprove = async (payrollId: string) => {
    try {
      await approve(payrollId);
      alert('Penggajian berhasil disetujui');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert('Gagal menyetujui penggajian: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleReject = async (payrollId: string, reason: string) => {
    try {
      await reject(payrollId, reason);
      alert('Penggajian berhasil ditolak');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert('Gagal menolak penggajian: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Dashboard Penggajian</h1>
          <p className="text-green-100 mt-2">Kelola penggajian karyawan secara efisien</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            💰 Daftar Penggajian
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚙️ Pengaturan Upah
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            💳 Dompet
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Wallet Widget */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Saldo Dompet Admin</h2>
                  <WalletWidget onTopUpSuccess={() => setRefreshKey((prev) => prev + 1)} />
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-800">Statistik Cepat</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-yellow-100 rounded-lg p-4 border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700">Menunggu Persetujuan</p>
                      <p className="text-2xl font-bold text-yellow-600">0</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4 border-l-4 border-green-500">
                      <p className="text-sm text-gray-700">Disetujui</p>
                      <p className="text-2xl font-bold text-green-600">0</p>
                    </div>
                    <div className="bg-red-100 rounded-lg p-4 border-l-4 border-red-500">
                      <p className="text-sm text-gray-700">Ditolak</p>
                      <p className="text-2xl font-bold text-red-600">0</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700">Berhasil</p>
                      <p className="text-2xl font-bold text-blue-600">0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Statistik</h2>
                <PayrollStats key={`stats-${refreshKey}`} payrolls={[]} />
              </div>
            </div>
          )}

          {/* Payroll List Tab */}
          {activeTab === 'payroll' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Penggajian</h2>
              <PayrollList
                key={`payroll-list-${refreshKey}`}
                isAdmin={true}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <WageVariablesForm onSave={() => setRefreshKey((prev) => prev + 1)} />
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Manajemen Dompet</h2>
                  <WalletWidget onTopUpSuccess={() => setRefreshKey((prev) => prev + 1)} />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">ℹ️ Informasi Dompet</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span>💰</span>
                      <span>Saldo minimum untuk transfer: 1 SawitDollar ($)</span>
                    </li>
                    <li className="flex gap-2">
                      <span>💵</span>
                      <span>1 SawitDollar ($) = Rp 10.000,00</span>
                    </li>
                    <li className="flex gap-2">
                      <span>📤</span>
                      <span>Saldo akan berkurang saat menyetujui penggajian</span>
                    </li>
                    <li className="flex gap-2">
                      <span>🔄</span>
                      <span>Top-up dapat dilakukan kapan saja</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Pembayaran sandbox tersedia untuk testing</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Transaksi</h3>
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada riwayat transaksi</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
