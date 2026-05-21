'use client';

import React, { useState, useEffect } from 'react';
import { Payroll, PayrollStatus, PayrollFilters } from '../types';
import { usePayment } from '../hooks';
import PayrollCard from './PayrollCard';

interface PayrollListProps {
  filters?: PayrollFilters;
  onFilterChange?: (filters: PayrollFilters) => void;
  isAdmin?: boolean;
  onApprove?: (payrollId: string) => void;
  onReject?: (payrollId: string, reason: string) => void;
}

const PayrollList: React.FC<PayrollListProps> = ({
  filters,
  onFilterChange,
  isAdmin = false,
  onApprove,
  onReject,
}) => {
  const { payrolls, loading, error, fetchPayrolls } = usePayment();
  const [activeFilters, setActiveFilters] = useState<PayrollFilters>(filters || {});

  useEffect(() => {
    fetchPayrolls(activeFilters);
  }, [activeFilters, fetchPayrolls]);

  const handleStatusFilter = (status: PayrollStatus | 'ALL') => {
    const newFilters = { ...activeFilters };
    if (status === 'ALL') {
      delete newFilters.status;
    } else {
      newFilters.status = status;
    }
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleDateFilter = (startDate: string, endDate: string) => {
    const newFilters = { ...activeFilters };
    if (startDate) newFilters.startDate = startDate;
    if (endDate) newFilters.endDate = endDate;
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const getStatusColor = (status: PayrollStatus) => {
    const statusColors: Record<PayrollStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🔍</span> Filter Daftar Gaji
          </h3>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Status Penggajian</p>
          <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              !activeFilters.status ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {['PENDING', 'APPROVED', 'REJECTED', 'SUCCESS', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status as PayrollStatus)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeFilters.status === status ? `${getStatusColor(status as PayrollStatus)} shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Rentang Tanggal</p>
          <div className="flex gap-3 flex-wrap">
          <input
            type="date"
            value={activeFilters.startDate || ''}
            onChange={(e) => handleDateFilter(e.target.value, activeFilters.endDate || '')}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tanggal Mulai"
          />
          <input
            type="date"
            value={activeFilters.endDate || ''}
            onChange={(e) => handleDateFilter(activeFilters.startDate || '', e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tanggal Akhir"
          />
          <button
            onClick={() => {
              setActiveFilters({});
              onFilterChange?.({});
            }}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-400 transition"
          >
            🔄 Reset
          </button>
        </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Payroll Cards */}
      {payrolls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">Tidak ada data gaji ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {payrolls.map((payroll) => (
            <PayrollCard
              key={payroll.id}
              payroll={payroll}
              isAdmin={isAdmin}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {payrolls.length > 0 && (
        <div className="text-center text-gray-600 text-sm">
          Total: {payrolls.length} data gaji
        </div>
      )}
    </div>
  );
};

export default PayrollList;
