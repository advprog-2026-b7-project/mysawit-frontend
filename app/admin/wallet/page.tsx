"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import PayrollTable from "@/features/payment/components/PayrollTable";
import { paymentApiClient } from "@/features/payment/api";
import { formatCurrency } from "@/lib/utils";
import type { PayrollResponse } from "@/features/payment/types";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function AdminWalletPage() {
  const { user, loading: authLoading } = useRoleDashboard("ADMIN");
  const [payrolls, setPayrolls] = useState<PayrollResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentApiClient.listPayrolls(0, 100);
      const list = (res as { data?: { content?: PayrollResponse[] } }).data;
      setPayrolls(list?.content ?? []);
    } catch {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayrolls();
  }, [loadPayrolls]);

  const acceptedPayrolls = useMemo(
    () => payrolls.filter((p) => p.status === "ACCEPTED"),
    [payrolls]
  );

  const totalEarnings = useMemo(
    () => acceptedPayrolls.reduce((sum, p) => sum + (p.amount || 0), 0),
    [acceptedPayrolls]
  );

  return (
    <AdminLayout activePage="Wallet" currentUser={user}>
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
          Wallet Overview
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
          Total approved payroll across all workers
        </p>

        {!loading && (
          <div
            style={{
              background: "linear-gradient(135deg, #1a6b3c, #2d9f5e)",
              borderRadius: 16,
              padding: "24px 32px",
              marginBottom: 32,
              color: "#FFFFFF",
            }}
          >
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                opacity: 0.9,
                margin: 0,
              }}
            >
              Total Approved Payroll
            </p>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: 36,
                margin: "4px 0 0 0",
              }}
            >
              {formatCurrency(totalEarnings)}
            </h2>
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 13,
                opacity: 0.8,
                margin: "4px 0 0 0",
              }}
            >
              {acceptedPayrolls.length} approved payroll
              {acceptedPayrolls.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <h3
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: 20,
            color: "#5B2012",
            margin: "0 0 16px 0",
          }}
        >
          Approved Payroll Records
        </h3>
        <PayrollTable
          payrolls={acceptedPayrolls}
          loading={loading || authLoading}
        />
      </div>
    </AdminLayout>
  );
}
