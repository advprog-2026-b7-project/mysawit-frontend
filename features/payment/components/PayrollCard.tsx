'use client';

import React, { useState } from 'react';
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
      <div className={`${colors.bg} border-l-4 rounded-lg p-5 hover:shadow-lg transition-all duration-200 bg-white border-b border-r border-gray-100`} style={{
        borderLeftColor: payroll.status === 'PENDING' ? '#FBBF24' : payroll.status === 'APPROVED' ? '#10B981' : payroll.status === 'SUCCESS' ? '#10B981' : '#EF4444'
      }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900">{payroll.workerName || payroll.workerId}</h4>
            <p className="text-sm text-gray-500 font-medium mt-1">🆔 {payroll.workerId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
            {payroll.status}
          </span>
        </div>

        {/* Amount & Reference */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">💰 Jumlah Gaji</p>
            <p className="text-2xl font-bold text-green-700">{amount}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">📌 Referensi</p>
            <p className="text-sm text-gray-800 font-mono break-all">{payroll.referenceId}</p>
          </div>
        </div>

        {/* Description */}
        {payroll.description && (
          <div className="mb-4 pb-4 border-b border-gray-200 bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">📝 Keterangan Perhitungan</p>
            <p className="text-sm text-gray-800 font-medium">{payroll.description}</p>
          </div>
        )}

        {/* Rejection Reason */}
        {payroll.status === 'REJECTED' && payroll.rejectionReason && (
          <div className="mb-4 pb-4 border-b border-red-300 bg-red-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700 mb-2">❌ Alasan Penolakan</p>
            <p className="text-sm text-red-800 font-medium">{payroll.rejectionReason}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          {payroll.createdAt && <span>Dibuat: {new Date(payroll.createdAt).toLocaleDateString('id-ID')}</span>}
          {payroll.updatedAt && <span>Diperbarui: {new Date(payroll.updatedAt).toLocaleDateString('id-ID')}</span>}
        </div>

        {/* Admin Actions */}
        {isAdmin && payroll.status === 'PENDING' && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isSubmitting ? '⏳ Memproses...' : '✅ Setujui'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              ❌ Tolak
            </button>
          </div>
        )}

        {/* Non-pending status indicator */}
        {!isAdmin && payroll.status !== 'PENDING' && (
          <div className="text-sm text-gray-600 pt-2 italic">
            Status telah ditentukan oleh Admin
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tolak Penggajian</h3>
            <p className="text-sm text-gray-600 mb-4">Masukkan alasan penolakan:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 mb-4 text-sm"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:bg-gray-400 transition"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
              >
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
