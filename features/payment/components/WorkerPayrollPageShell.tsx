'use client';

import React from 'react';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export function formatCurrency(value: number) {
  return rupiahFormatter.format(value);
}

type ThemeKey = 'green' | 'blue' | 'orange';

type WorkerPayrollPageShellProps = {
  theme: ThemeKey;
  roleLabel: string;
  title: string;
  description: string;
  userLabel: string;
  userId: string;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ key: string; label: string }>;
  panels: Record<string, React.ReactNode>;
};

const themeMap: Record<ThemeKey, { accent: string; accentSoft: string; accentStrong: string; gradient: string }> = {
  green: {
    accent: '#4C6430',
    accentSoft: '#F0F7EA',
    accentStrong: '#5B2012',
    gradient: 'bg-[linear-gradient(135deg,#F6F3F1_0%,#F8F2EC_55%,#EEF4E6_100%)]',
  },
  blue: {
    accent: '#2F5F8A',
    accentSoft: '#EDF5FB',
    accentStrong: '#1F4261',
    gradient: 'bg-[linear-gradient(135deg,#F6F3F1_0%,#F0F5FA_55%,#E7EEF8_100%)]',
  },
  orange: {
    accent: '#A35A3A',
    accentSoft: '#FBF4EA',
    accentStrong: '#5B2012',
    gradient: 'bg-[linear-gradient(135deg,#F6F3F1_0%,#F8EEE7_55%,#F5E8E1_100%)]',
  },
};

export default function WorkerPayrollPageShell({
  theme,
  roleLabel,
  title,
  description,
  userLabel,
  userId,
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount,
  totalAmount,
  pendingAmount,
  approvedAmount,
  activeTab,
  onTabChange,
  tabs,
  panels,
}: WorkerPayrollPageShellProps) {
  const palette = themeMap[theme];
  const activePanel = panels[activeTab] ?? null;

  return (
    <div className="min-h-screen bg-[#F6F3F1] text-[#211A18]">
      <section className={`relative overflow-hidden border-b border-[#E8D6CF] ${palette.gradient}`}>
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_top_left,rgba(187,115,84,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(76,100,48,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] shadow-sm backdrop-blur"
              style={{ borderColor: `${palette.accent}22`, color: palette.accent }}
            >
              {roleLabel}
            </div>
            <div className="space-y-3">
              <h1 className="admin-heading max-w-2xl text-4xl font-bold leading-tight text-[#5B2012] sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#52443D] sm:text-lg">{description}</p>
            </div>
            <p className="text-sm text-[#8A4B2F]">
              {userLabel}: <span className="font-semibold text-[#5B2012]">{userId}</span>
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#DBC1B9] bg-white p-4 shadow-[0_12px_40px_rgba(91,32,18,0.06)]">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl border border-[#DBC1B9] bg-[#FFFDFC] p-4">
                <p className="text-sm font-semibold text-[#52443D]">Total Penggajian</p>
                <p className="mt-2 text-2xl font-bold text-[#5B2012]">{totalCount}</p>
              </div>
              <div className="rounded-2xl border border-[#E2D1B0] bg-[#FFF9E8] p-4">
                <p className="text-sm font-semibold text-[#52443D]">Menunggu</p>
                <p className="mt-2 text-2xl font-bold text-[#B07700]">{pendingCount}</p>
              </div>
              <div className="rounded-2xl border border-[#CFE0C2] bg-[#F0F7EA] p-4">
                <p className="text-sm font-semibold text-[#52443D]">Disetujui</p>
                <p className="mt-2 text-2xl font-bold text-[#4C6430]">{approvedCount}</p>
              </div>
              <div className="rounded-2xl border border-[#E4C9C1] bg-[#FFF4F0] p-4">
                <p className="text-sm font-semibold text-[#52443D]">Ditolak</p>
                <p className="mt-2 text-2xl font-bold text-[#BA1A1A]">{rejectedCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#DBC1B9] bg-white p-5 shadow-[0_12px_40px_rgba(91,32,18,0.06)]">
            <div className="flex flex-wrap gap-2 border-b border-[#E7D7D0] pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === tab.key
                      ? 'bg-[#5B2012] text-white shadow-md'
                      : 'text-[#5B2012] hover:bg-[#FBF4EA]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-5">{activePanel}</div>
          </div>
        </div>
      </main>
    </div>
  );
}