'use client';

import React, { useEffect, useState } from 'react';
import { useWorkerPayroll } from '@/features/payment/hooks';
import { PayrollCard } from '@/features/payment/components';
import type { Payroll, PayrollStatus } from '@/features/payment/types';

interface WorkerPayrollSectionProps {
  userId: string;
  workerType: 'BURUH' | 'SUPIR_TRUK' | 'MANDOR';
  workerName: string;
}

const WorkerPayrollSection: React.FC<WorkerPayrollSectionProps> = ({
  userId,
  workerType,
  workerName,
}) => {
  const { payrolls, loading, error } = useWorkerPayroll(userId);
  const [displayCount, setDisplayCount] = useState(3); // Show first 3 payrolls
  const [selectedStatus, setSelectedStatus] = useState<PayrollStatus | 'ALL'>('ALL');

  // Filter payrolls by status
  const filteredPayrolls = payrolls.filter(
    (p) => selectedStatus === 'ALL' || p.status === selectedStatus
  );

  // Get stats
  const totalAmount = payrolls.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payrolls
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);
  const approvedAmount = payrolls
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getWorkerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BURUH: 'Buruh',
      SUPIR_TRUK: 'Supir Truk',
      MANDOR: 'Mandor',
    };
    return labels[type] || type;
  };

  return (
    <section className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">💰 Penggajian Saya</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tipe Pekerja: <span className="font-semibold">{getWorkerTypeLabel(workerType)}</span>
          </p>
        </div>
        <a
          href="/payment/payroll"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
        >
          Lihat Semua →
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Pendapatan</p>
          <p className="text-xl font-bold">{formatRupiah(totalAmount)}</p>
          <p className="text-xs opacity-75 mt-1">{payrolls.length} Penggajian</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Menunggu Persetujuan</p>
          <p className="text-xl font-bold">{formatRupiah(pendingAmount)}</p>
          <p className="text-xs opacity-75 mt-1">
            {payrolls.filter((p) => p.status === 'PENDING').length} Penggajian
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Sudah Disetujui</p>
          <p className="text-xl font-bold">{formatRupiah(approvedAmount)}</p>
          <p className="text-xs opacity-75 mt-1">
            {payrolls.filter((p) => p.status === 'APPROVED').length} Penggajian
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status as PayrollStatus | 'ALL')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'ALL'
              ? 'Semua'
              : status === 'PENDING'
                ? 'Menunggu'
                : status === 'APPROVED'
                  ? 'Disetujui'
                  : 'Ditolak'}
          </button>
        ))}
      </div>

      {/* Payroll List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPayrolls.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">Belum ada penggajian</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayrolls.slice(0, displayCount).map((payroll) => (
            <PayrollCard
              key={payroll.id}
              payroll={payroll}
              isAdmin={false}
            />
          ))}

          {/* Show More Button */}
          {filteredPayrolls.length > displayCount && (
            <button
              onClick={() => setDisplayCount((prev) => prev + 3)}
              className="w-full py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm border border-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Tampilkan 3 Lebih Banyak...
            </button>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Info:</strong> Penggajian dibuat otomatis saat panen atau pengiriman disetujui.
          Status default adalah <strong>Menunggu Persetujuan</strong>. Setelah Admin menyetujui, 
          gaji Anda akan ditransfer.
        </p>
      </div>
    </section>
  );
};

export default WorkerPayrollSection;
