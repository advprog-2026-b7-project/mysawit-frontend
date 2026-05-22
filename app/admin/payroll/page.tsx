"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import PayrollTable from "@/features/payment/components/PayrollTable";
import { paymentApiClient } from "@/features/payment/api";
import type { PayrollResponse } from "@/features/payment/types";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function AdminPayrollPage() {
  const { user, loading: authLoading } = useRoleDashboard("ADMIN");
  const [payrolls, setPayrolls] = useState<PayrollResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentApiClient.listPayrolls(0, 50);
      setPayrolls(res.payrolls ?? []);
    } catch {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadPayrolls();
  }, [user, loadPayrolls]);

  const handleApprove = async (id: string) => {
    try {
      await paymentApiClient.approvePayroll(id);
      void loadPayrolls();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    const note = prompt("Rejection reason:");
    if (note === null) return;
    try {
      await paymentApiClient.rejectPayroll(id, note || undefined);
      void loadPayrolls();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reject");
    }
  };

  return (
    <AdminLayout activePage="Payroll" currentUser={user}>
      <div style={{ padding: "32px 0" }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 50,
            color: "#5B2012",
            margin: 0,
          }}
        >
          Payroll
        </h1>
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#52443D",
            margin: "8px 0 32px 0",
          }}
        >
          Manage and review all payroll records
        </p>
        <PayrollTable
          payrolls={payrolls}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading || authLoading}
        />
      </div>
    </AdminLayout>
  );
}
