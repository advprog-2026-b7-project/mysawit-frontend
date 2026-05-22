'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ClipboardListIcon, WalletIcon } from '@/components/layout/AdminIcons';
import { usePayment } from '@/features/payment/hooks';
import { PayrollList, WageVariablesForm } from '@/features/payment/components';
import { useRoleDashboard } from '@/features/admin/useRoleDashboard';

export default function AdminPaymentPage() {
  const { user, loading: authLoading } = useRoleDashboard('ADMIN');
  const { payrolls, loading, fetchPayrolls, approve, reject } = usePayment();
  const [activeTab, setActiveTab] = useState<'payroll' | 'settings' | 'wallet'>('payroll');
  const [refreshKey, setRefreshKey] = useState(0);

  React.useEffect(() => {
    void fetchPayrolls();
  }, [fetchPayrolls, refreshKey]);

  if (authLoading || !user) {
    return (
      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: '#52443D' }}>
        Loading payment page...
      </div>
    );
  }

  const handleApprove = async (payrollId: string) => {
    try {
      await approve(payrollId);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert('Gagal menyetujui penggajian: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleReject = async (payrollId: string, reason: string) => {
    try {
      await reject(payrollId, reason);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert('Gagal menolak penggajian: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <AdminLayout activePage="Payroll" currentUser={user}>
      <div className="flex flex-col gap-8 text-[#211A18]">
        <header className="space-y-3">
          <p className="font-normal text-[18px] text-[#52443D]">
            Welcome back, {user.nama || user.username || 'Admin'}
          </p>
          <h1 className="admin-heading text-[50px] font-bold tracking-[-1.25px] text-[#5B2012]">
            Dashboard Penggajian
          </h1>
          <p className="max-w-3xl text-[16px] leading-7 text-[#52443D]">
            Kelola persetujuan payroll, pengaturan variabel upah, dan riwayat pembayaran dari satu tempat yang lebih sederhana.
          </p>
        </header>

        <section className="rounded-2xl border border-[#DBC1B9] bg-white px-4 pt-2 shadow-[0_4px_20px_rgba(91,32,18,0.04)]">
          <div className="flex flex-wrap gap-2 border-b border-[#E7D7D0]">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'payroll'
                ? 'border-[#BB7354] text-[#BB7354]'
                : 'border-transparent text-[#52443D] hover:text-[#5B2012]'
            }`}
          >
            <span className="mr-2 inline-flex align-middle text-current">
              <ClipboardListIcon width={16} height={16} />
            </span>
            Daftar Penggajian
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-[#BB7354] text-[#BB7354]'
                : 'border-transparent text-[#52443D] hover:text-[#5B2012]'
            }`}
          >
            <span className="mr-2 inline-flex align-middle text-current">
              <WalletIcon width={16} height={16} />
            </span>
            Pengaturan Upah
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'wallet'
                ? 'border-[#BB7354] text-[#BB7354]'
                : 'border-transparent text-[#52443D] hover:text-[#5B2012]'
            }`}
          >
            <span className="mr-2 inline-flex align-middle text-current">
              <WalletIcon width={16} height={16} />
            </span>
            Dompet
          </button>
          </div>
        </section>

        <section className="rounded-3xl border border-[#DBC1B9] bg-[#FFFDFC] p-6 shadow-[0_12px_40px_rgba(91,32,18,0.06)]">
          {activeTab === 'payroll' && (
            <div>
              <PayrollList
                key={`payroll-list-${refreshKey}`}
                isAdmin={true}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <WageVariablesForm onSave={() => setRefreshKey((prev) => prev + 1)} />
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="rounded-[12px] border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
              <p className="text-[18px] font-semibold text-[var(--color-text-heading)]">
                Fitur dompet sedang disiapkan
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-body)]">
                Area ini bisa dipakai untuk histori transfer atau saldo payroll.
              </p>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
