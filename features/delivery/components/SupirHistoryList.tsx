"use client";

import { useCallback, useEffect, useState } from "react";
import { deliveryApiClient } from "@/features/delivery/deliveryApi";
import type { ShipmentResponse } from "@/features/delivery/deliveryTypes";
import ShipmentStatusBadge from "./ShipmentStatusBadge";

function formatDate(str?: string | null): string {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

function shortId(uuid?: string | null): string {
  if (!uuid) return "—";
  return uuid.slice(0, 8) + "…";
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  color: "#52443D",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  display: "block",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  height: 50,
  background: "#FFFFFF",
  border: "1px solid #DBC1B9",
  borderRadius: 12,
  padding: "0 16px",
  fontFamily: "'Lato', sans-serif",
  fontSize: 16,
  color: "#1B1C1B",
  outline: "none",
  boxSizing: "border-box",
};

function defaultStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultEndDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SupirHistoryList() {
  const [items, setItems] = useState<ShipmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [searched, setSearched] = useState(false);

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await deliveryApiClient.getMyHistory(startDate, endDate);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Load on mount with defaults
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const colStyle: React.CSSProperties = {
    padding: "14px 20px",
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    color: "#52443D",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    textAlign: "left",
  };

  const cellStyle: React.CSSProperties = {
    padding: "16px 20px",
    fontFamily: "'Lato', sans-serif",
    fontSize: 14,
    color: "#1B1C1B",
    borderTop: "1px solid #DBC1B9",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <header>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 50,
            color: "#5B2012",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Delivery History
        </h1>
        <p
          style={{
            marginTop: 12,
            fontFamily: "'Lato', sans-serif",
            fontSize: 16,
            color: "#52443D",
          }}
        >
          Review your completed and closed shipment records
        </p>
      </header>

      {/* Filters */}
      <section
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
          padding: 28,
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ ...inputStyle, width: 180 }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ ...inputStyle, width: 180 }}
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || !startDate || !endDate}
          style={{
            height: 50,
            background: "#BB7354",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 9999,
            padding: "0 32px",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading || !startDate || !endDate ? "not-allowed" : "pointer",
            opacity: loading || !startDate || !endDate ? 0.5 : 1,
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
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

      {/* Table */}
      <section
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F6F3F1", borderBottom: "1px solid #DBC1B9" }}>
              <th style={colStyle}>Date</th>
              <th style={colStyle}>Plantation</th>
              <th style={colStyle}>Total Weight</th>
              <th style={colStyle}>Recognized Weight</th>
              <th style={colStyle}>Status</th>
              <th style={colStyle}>Rejection Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#53433D", borderTop: "none" }}>
                  Loading history...
                </td>
              </tr>
            ) : !searched ? (
              <tr>
                <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#53433D", borderTop: "none" }}>
                  Select a date range and press Search
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#53433D", borderTop: "none" }}>
                  No delivery history found for this period
                </td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s.id}>
                  <td style={cellStyle}>{formatDate(s.updatedAt || s.createdAt)}</td>
                  <td style={cellStyle}>
                    <span
                      title={s.plantationId}
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 12,
                        color: "#5B2012",
                        background: "#EDE8E4",
                        borderRadius: 4,
                        padding: "2px 6px",
                      }}
                    >
                      {shortId(s.plantationId)}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, fontWeight: 700, color: "#5B2012" }}>
                    {Number(s.totalWeightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg
                  </td>
                  <td style={{ ...cellStyle, fontWeight: s.recognizedWeightKg != null ? 700 : 400, color: s.recognizedWeightKg != null ? "#5B2012" : "#52443D" }}>
                    {s.recognizedWeightKg != null
                      ? `${Number(s.recognizedWeightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`
                      : "—"}
                  </td>
                  <td style={cellStyle}>
                    <ShipmentStatusBadge status={s.status} />
                  </td>
                  <td style={{ ...cellStyle, color: "#BA1A1A", fontStyle: s.rejectionReason ? "normal" : "italic" }}>
                    {s.rejectionReason || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #DBC1B9",
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#52443D",
          }}
        >
          {loading ? "Loading..." : searched ? `${items.length} record${items.length === 1 ? "" : "s"} found` : "Enter a date range to search"}
        </div>
      </section>
    </div>
  );
}
