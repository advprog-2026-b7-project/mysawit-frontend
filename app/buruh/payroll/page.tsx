'use client';

import { useState } from 'react';
import SideNavBar from '@/components/layout/SideNavBar';
import { useRoleDashboard } from '@/features/admin/useRoleDashboard';
import WorkerPayrollSection from '@/features/payment/components/WorkerPayrollSection';

export default function BuruhPayrollPage() {
  const { user, loading } = useRoleDashboard('BURUH');
  const [collapsed, setCollapsed] = useState(false);

  if (loading || !user) {
    return (
      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: '#52443D' }}>
        Loading payroll page...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SideNavBar activePage="My Payroll" currentUser={user} onCollapsedChange={setCollapsed} />
      <main
        style={{ marginLeft: collapsed ? 72 : 256 }}
        className="min-h-screen p-12 transition-[margin-left] duration-200 ease-in-out"
      >
        <WorkerPayrollSection userId={user.id} workerType="BURUH" workerName={user.nama ?? user.username ?? user.email} />
      </main>
    </div>
  );
}