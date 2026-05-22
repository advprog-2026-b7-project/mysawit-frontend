'use client';

import React, { useState, useEffect } from 'react';
import { SearchIcon } from '@/components/layout/AdminIcons';
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
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#5B2012]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#211A18]">
      <div className="rounded-3xl border border-[#DBC1B9] bg-white p-6 shadow-[0_12px_40px_rgba(91,32,18,0.06)] space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#5B2012]">
            <span className="inline-flex text-current">
              <SearchIcon width={18} height={18} />
            </span>
            Filter Daftar Penggajian
          </h3>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#52443D]">Status Penggajian</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('ALL')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !activeFilters.status ? 'bg-[#5B2012] text-white shadow-md' : 'bg-[#F6F1ED] text-[#52443D] hover:bg-[#EFE5DF]'
              }`}
            >
              Semua
            </button>
            {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status as PayrollStatus)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeFilters.status === status
                    ? `${getStatusColor(status as PayrollStatus)} shadow-md`
                    : 'bg-[#F6F1ED] text-[#52443D] hover:bg-[#EFE5DF]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#52443D]">Rentang Tanggal</p>
          <div className="flex gap-3 flex-wrap">
          <input
            type="date"
            value={activeFilters.startDate || ''}
            onChange={(e) => handleDateFilter(e.target.value, activeFilters.endDate || '')}
            className="rounded-xl border border-[#DCCBC3] px-4 py-2 text-sm focus:border-[#A35A3A] focus:outline-none focus:ring-2 focus:ring-[#A35A3A]/20"
            placeholder="Tanggal Mulai"
          />
          <input
            type="date"
            value={activeFilters.endDate || ''}
            onChange={(e) => handleDateFilter(activeFilters.startDate || '', e.target.value)}
            className="rounded-xl border border-[#DCCBC3] px-4 py-2 text-sm focus:border-[#A35A3A] focus:outline-none focus:ring-2 focus:ring-[#A35A3A]/20"
            placeholder="Tanggal Akhir"
          />
          <button
            onClick={() => {
              setActiveFilters({});
              onFilterChange?.({});
            }}
            className="rounded-xl bg-[#F3ECE8] px-4 py-2 text-sm font-semibold text-[#5B2012] transition hover:bg-[#E9DDD7]"
          >
            Reset
          </button>
        </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#E4C9C1] bg-[#FFF4F0] px-4 py-3 text-[#BA1A1A]">
          {error}
        </div>
      )}

      {payrolls.length === 0 ? (
        <div className="rounded-3xl border border-[#E3D4CD] bg-white px-6 py-12 text-center shadow-[0_12px_40px_rgba(91,32,18,0.06)]">
          <p className="text-lg text-[#52443D]">Tidak ada data penggajian ditemukan</p>
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

      {payrolls.length > 0 && (
        <div className="text-center text-sm text-[#52443D]">
          Total: {payrolls.length} data penggajian
        </div>
      )}
    </div>
  );
};

export default PayrollList;
