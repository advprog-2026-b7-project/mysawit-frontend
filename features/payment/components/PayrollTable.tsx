"use client";

import type { PayrollResponse } from "@/features/payment/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PayrollTableProps {
  payrolls: PayrollResponse[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  PENDING: "#F59E0B",
  PROCESSING: "#3B82F6",
  SUCCESS: "#10B981",
  FAILED: "#EF4444",
  ACCEPTED: "#10B981",
  REJECTED: "#EF4444",
};

export default function PayrollTable({
  payrolls,
  onApprove,
  onReject,
  loading,
}: PayrollTableProps) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#888" }}>
        Loading payroll data...
      </div>
    );
  }

  if (!payrolls || payrolls.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#888" }}>
        No payroll records found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "2px solid #E5E7EB",
              color: "#6B7280",
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Worker</th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Type</th>
            <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount</th>
            <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
            <th style={{ padding: "12px 16px", textAlign: "left" }}>Date</th>
            {(onApprove || onReject) && (
              <th style={{ padding: "12px 16px", textAlign: "center" }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {payrolls.map((payroll) => (
            <tr
              key={payroll.id}
              style={{
                borderBottom: "1px solid #E5E7EB",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F9FAFB")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <td
                style={{
                  padding: "12px 16px",
                  fontWeight: 600,
                  color: "#1F2937",
                }}
              >
                {payroll.workerName || payroll.workerId}
              </td>
              <td style={{ padding: "12px 16px", color: "#4B5563" }}>
                {payroll.payrollType}
              </td>
              <td
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "#1F2937",
                }}
              >
                {formatCurrency(payroll.amount)}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    background: statusColors[payroll.status] || "#6B7280",
                  }}
                >
                  {payroll.status}
                </span>
              </td>
              <td
                style={{
                  padding: "12px 16px",
                  color: "#4B5563",
                  fontSize: 14,
                }}
              >
                {formatDate(payroll.createdAt)}
              </td>
              {(onApprove || onReject) && (
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {onApprove && payroll.status === "PENDING" && (
                      <button
                        onClick={() => onApprove(payroll.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          border: "none",
                          background: "#10B981",
                          color: "#FFFFFF",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                    )}
                    {onReject && payroll.status === "PENDING" && (
                      <button
                        onClick={() => onReject(payroll.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          border: "none",
                          background: "#EF4444",
                          color: "#FFFFFF",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
