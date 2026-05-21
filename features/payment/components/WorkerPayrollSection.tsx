'use client';

import React, { useState } from 'react';
import { useWorkerPayroll } from '@/features/payment/hooks';
import { PayrollCard } from '@/features/payment/components';
import { DashboardStatCard } from '@/components/dashboard/DashboardComponents';
import { CheckCircleIcon, ClockIcon, WalletIcon } from '@/components/layout/AdminIcons';
import type { PayrollStatus } from '@/features/payment/types';

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
  const [displayCount, setDisplayCount] = useState(3);
  const [selectedStatus, setSelectedStatus] = useState<PayrollStatus | 'ALL'>('ALL');

  const filteredPayrolls = payrolls.filter(
    (p) => selectedStatus === 'ALL' || p.status === selectedStatus
  );

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="admin-heading text-[32px] font-bold text-[#6D2615]">Penggajian Saya</h2>
        <a
          href="/payment/payroll"
          className="rounded-lg px-6 py-3 font-bold text-[#854E31] transition hover:bg-[#FBF4EA]"
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
          }}
        >
          Lihat Semua
        </a>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-3 gap-8">
        <DashboardStatCard
          title="Total Pendapatan"
          value={formatRupiah(totalAmount)}
          Icon={WalletIcon}
          tone="beige"
          subtitle={`${payrolls.length} Penggajian`}
        />
        <DashboardStatCard
          title="Menunggu Persetujuan"
          value={formatRupiah(pendingAmount)}
          Icon={ClockIcon}
          tone="beige"
          subtitle={`${payrolls.filter((p) => p.status === 'PENDING').length} Penggajian`}
        />
        <DashboardStatCard
          title="Sudah Disetujui"
          value={formatRupiah(approvedAmount)}
          Icon={CheckCircleIcon}
          tone="green"
          subtitle={`${payrolls.filter((p) => p.status === 'APPROVED').length} Penggajian`}
        />
      </section>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(186,26,26,0.08)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#BA1A1A",
          }}
        >
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="space-y-4">
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#52443D",
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          Filter Status
        </p>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as PayrollStatus | 'ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                selectedStatus === status
                  ? 'text-white'
                  : 'bg-[#FBF4EA] text-[#8A4B2F] hover:bg-[#F3E8E5]'
              }`}
              style={
                selectedStatus === status
                  ? {
                      background: "#A35A3A",
                      color: "white",
                    }
                  : {}
              }
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
      </div>

      {/* Payroll List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A35A3A]"></div>
        </div>
      ) : filteredPayrolls.length === 0 ? (
        <div
          className="text-center py-8 rounded-lg"
          style={{
            background: "#FBF4EA",
            border: "1px dashed #DBC1B9",
          }}
        >
          <p style={{ fontSize: 14, color: "#53433D", fontWeight: 600 }}>
            Belum ada penggajian
          </p>
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

          {filteredPayrolls.length > displayCount && (
            <button
              onClick={() => setDisplayCount((prev) => prev + 3)}
              className="w-full py-3 font-bold text-sm transition rounded-lg"
              style={{
                background: "#FFFFFF",
                border: "1px solid #DBC1B9",
                color: "#A35A3A",
              }}
            >
              Tampilkan 3 Lebih Banyak
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerPayrollSection;
