"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import PayrollTable from "@/features/payment/components/PayrollTable";
import { paymentApiClient } from "@/features/payment/api";
import type { PayrollResponse } from "@/features/payment/types";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function BuruhPaymentPage() {
  const { user, loading: authLoading } = useRoleDashboard("BURUH");
  const [payrolls, setPayrolls] = useState<PayrollResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayrolls = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await paymentApiClient.getPayrollByWorker(user.id);
      setPayrolls(Array.isArray(res) ? res : []);
    } catch {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPayrolls();
  }, [loadPayrolls]);

  return (
    <AdminLayout activePage="My Payment" currentUser={user}>
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
          My Payment
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
          View your payment history
        </p>
        <PayrollTable
          payrolls={payrolls}
          loading={loading || authLoading}
        />
      </div>
    </AdminLayout>
  );
}
