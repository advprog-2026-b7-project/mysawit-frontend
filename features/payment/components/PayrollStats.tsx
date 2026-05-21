'use client';

import React, { useEffect, useState } from 'react';
import { Payroll, PayrollStatus } from '../types';

interface PayrollStatsProps {
  payrolls: Payroll[];
  isLoading?: boolean;
}

const PayrollStats: React.FC<PayrollStatsProps> = ({ payrolls, isLoading = false }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    success: 0,
    failed: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
  });

  useEffect(() => {
    const newStats = {
      total: payrolls.length,
      pending: payrolls.filter((p) => p.status === 'PENDING').length,
      approved: payrolls.filter((p) => p.status === 'APPROVED').length,
      rejected: payrolls.filter((p) => p.status === 'REJECTED').length,
      success: payrolls.filter((p) => p.status === 'SUCCESS').length,
      failed: payrolls.filter((p) => p.status === 'FAILED').length,
      totalAmount: payrolls.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payrolls
        .filter((p) => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0),
      approvedAmount: payrolls
        .filter((p) => p.status === 'APPROVED')
        .reduce((sum, p) => sum + p.amount, 0),
    };
    setStats(newStats);
  }, [payrolls]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const StatCard = ({
    title,
    value,
    amount,
    color,
    icon,
  }: {
    title: string;
    value: number;
    amount?: number;
    color: string;
    icon: React.ReactNode;
  }) => (
    <div className={`${color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="text-5xl opacity-40">{icon}</div>
      </div>
      {amount !== undefined && (
        <p className="text-xs font-semibold opacity-85 mt-3 pt-3 border-t border-white border-opacity-20">{formatRupiah(amount)}</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg p-4 animate-pulse h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Penggajian"
          value={stats.total}
          amount={stats.totalAmount}
          color="bg-blue-600"
          icon="📊"
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={stats.pending}
          amount={stats.pendingAmount}
          color="bg-yellow-600"
          icon="⏳"
        />
        <StatCard
          title="Disetujui"
          value={stats.approved}
          amount={stats.approvedAmount}
          color="bg-green-600"
          icon="✓"
        />
      </div>

      {/* Detailed Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ditolak"
          value={stats.rejected}
          color="bg-red-600"
          icon="✗"
        />
        <StatCard
          title="Berhasil"
          value={stats.success}
          color="bg-emerald-600"
          icon="💚"
        />
        <StatCard
          title="Gagal"
          value={stats.failed}
          color="bg-rose-600"
          icon="❌"
        />
      </div>

      {/* Status Distribution */}
      {stats.total > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Status</h3>
          <div className="space-y-3">
            {[
              { status: 'PENDING', value: stats.pending, color: 'bg-yellow-400', total: stats.total },
              { status: 'APPROVED', value: stats.approved, color: 'bg-green-400', total: stats.total },
              { status: 'REJECTED', value: stats.rejected, color: 'bg-red-400', total: stats.total },
              { status: 'SUCCESS', value: stats.success, color: 'bg-emerald-400', total: stats.total },
              { status: 'FAILED', value: stats.failed, color: 'bg-rose-400', total: stats.total },
            ].map(({ status, value, color, total }) => {
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{status}</span>
                    <span className="text-sm text-gray-600">
                      {value} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${color} h-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Belum ada data penggajian</p>
        </div>
      )}
    </div>
  );
};

export default PayrollStats;
