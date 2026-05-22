'use client';

import React, { useState } from 'react';
import { CheckCircleIcon, FileTextIcon, HistoryIcon, UserIcon, WalletIcon, XCircleIcon } from '@/components/layout/AdminIcons';
import { Payroll, PayrollStatus } from '../types';

interface PayrollCardProps {
  payroll: Payroll;
  isAdmin?: boolean;
  onApprove?: (payrollId: string) => void;
  onReject?: (payrollId: string, reason: string) => void;
}

const PayrollCard: React.FC<PayrollCardProps> = ({ payroll, isAdmin = false, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusColor = (status: PayrollStatus) => {
    const statusColors: Record<PayrollStatus, { bg: string; text: string; badge: string }> = {
      PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-100 text-green-800' },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-100 text-red-800' },
      SUCCESS: { bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-100 text-green-800' },
      FAILED: { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-100 text-red-800' },
    };
    return statusColors[status] || { bg: 'bg-gray-50', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-800' };
  };

  const handleApprove = async () => {
    if (onApprove && confirm('Setujui penggajian ini?')) {
      setIsSubmitting(true);
      try {
        await onApprove(payroll.id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReject = async () => {
    if (rejectReason.trim() && onReject) {
      setIsSubmitting(true);
      try {
        await onReject(payroll.id, rejectReason);
        setShowRejectModal(false);
        setRejectReason('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const colors = getStatusColor(payroll.status);
  const amount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(payroll.amount);

  return (
    <>
      <div className={`${colors.bg} rounded-3xl border border-[#E3D4CD] p-5 shadow-[0_10px_30px_rgba(91,32,18,0.06)] transition-all duration-200 hover:shadow-[0_14px_36px_rgba(91,32,18,0.1)]`} style={{
        borderLeftColor: payroll.status === 'PENDING' ? '#FBBF24' : payroll.status === 'APPROVED' ? '#10B981' : payroll.status === 'SUCCESS' ? '#10B981' : '#EF4444'
      }}>
        <div className="mb-4 flex items-start justify-between border-b border-[#E7D7D0] pb-4">
          <div className="flex-1">
            <h4 className="flex items-center gap-2 text-lg font-bold text-[#5B2012]">
              <span className="inline-flex text-[#8A4B2F]">
                <UserIcon width={18} height={18} />
              </span>
              {payroll.workerName || payroll.workerId}
            </h4>
            <p className="mt-1 text-sm font-medium text-[#8A4B2F]">ID {payroll.workerId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
            {payroll.status}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 border-b border-[#E7D7D0] pb-4">
          <div className="rounded-2xl border border-[#E8DDD7] bg-[#FFFDFC] p-3">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#52443D]">
              <WalletIcon width={14} height={14} />
              Jumlah Gaji
            </p>
            <p className="text-2xl font-bold text-[#4C6430]">{amount}</p>
          </div>
          <div className="rounded-2xl border border-[#E8DDD7] bg-[#FFFDFC] p-3">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#52443D]">
              <FileTextIcon width={14} height={14} />
              Referensi
            </p>
            <p className="break-all font-mono text-sm text-[#5B2012]">{payroll.referenceId}</p>
          </div>
        </div>

        {payroll.description && (
          <div className="mb-4 rounded-2xl border border-[#DCCBC3] bg-[#F8F2EC] p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#5B2012]">
              <FileTextIcon width={14} height={14} />
              Keterangan Perhitungan
            </p>
            <p className="text-sm font-medium text-[#52443D]">{payroll.description}</p>
          </div>
        )}

        {payroll.status === 'REJECTED' && payroll.rejectionReason && (
          <div className="mb-4 rounded-2xl border border-[#E4C9C1] bg-[#FFF4F0] p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#BA1A1A]">
              <XCircleIcon width={14} height={14} />
              Alasan Penolakan
            </p>
            <p className="text-sm font-medium text-[#8F1D1D]">{payroll.rejectionReason}</p>
          </div>
        )}

        <div className="mb-3 flex justify-between text-xs text-[#8A4B2F]">
          {payroll.createdAt && (
            <span className="inline-flex items-center gap-1.5">
              <HistoryIcon width={13} height={13} />
              Dibuat: {new Date(payroll.createdAt).toLocaleDateString('id-ID')}
            </span>
          )}
          {payroll.updatedAt && (
            <span className="inline-flex items-center gap-1.5">
              <HistoryIcon width={13} height={13} />
              Diperbarui: {new Date(payroll.updatedAt).toLocaleDateString('id-ID')}
            </span>
          )}
        </div>

        {isAdmin && payroll.status === 'PENDING' && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-[#4C6430] px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-[#3F5328] hover:shadow-lg disabled:bg-gray-400"
            >
              <span className="mr-2 inline-flex align-middle">
                <CheckCircleIcon width={14} height={14} />
              </span>
              {isSubmitting ? 'Memproses...' : 'Setujui'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-[#BA1A1A] px-4 py-2 font-bold text-white shadow-md transition-colors hover:bg-[#A11414] hover:shadow-lg disabled:bg-gray-400"
            >
              <span className="mr-2 inline-flex align-middle">
                <XCircleIcon width={14} height={14} />
              </span>
              Tolak
            </button>
          </div>
        )}

        {!isAdmin && payroll.status !== 'PENDING' && (
          <div className="pt-2 text-sm italic text-[#52443D]">
            Status telah ditentukan oleh Admin
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-[#DBC1B9] bg-[#FFFDFC] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h3 className="mb-4 text-lg font-bold text-[#5B2012]">Tolak Penggajian</h3>
            <p className="mb-4 text-sm text-[#52443D]">Masukkan alasan penolakan:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="mb-4 w-full rounded-2xl border border-[#DCCBC3] px-3 py-2 text-sm focus:border-[#BA1A1A] focus:outline-none focus:ring-2 focus:ring-[#BA1A1A]/20"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-[#F3ECE8] px-4 py-2 text-[#5B2012] transition hover:bg-[#E9DDD7] disabled:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isSubmitting}
                className="flex-1 rounded-2xl bg-[#BA1A1A] px-4 py-2 text-white transition hover:bg-[#A11414] disabled:bg-gray-400"
              >
                <span className="mr-2 inline-flex align-middle">
                  <XCircleIcon width={14} height={14} />
                </span>
                {isSubmitting ? 'Memproses...' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PayrollCard;
