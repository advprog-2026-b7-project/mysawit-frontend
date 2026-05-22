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

const btnPrimary: React.CSSProperties = {
  background: "#BB7354",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 9999,
  padding: "10px 28px",
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const btnOutline: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #DBC1B9",
  borderRadius: 9999,
  padding: "10px 28px",
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  color: "#5B2012",
  cursor: "pointer",
};

type ReviewMode = "approve" | "reject-full" | "reject-partial";

interface ReviewState {
  shipmentId: string;
  totalWeightKg: number;
  mode: ReviewMode;
  reason: string;
  recognizedKg: string;
}

function defaultStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export default function AdminDeliveryList() {
  const [items, setItems] = useState<ShipmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [review, setReview] = useState<ReviewState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApiClient.getAdminPendingReview(
        startDate || undefined,
        endDate || undefined
      );
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pending review.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { void load(); }, [load]);

  const openReview = (s: ShipmentResponse, mode: ReviewMode) => {
    setReview({
      shipmentId: s.id,
      totalWeightKg: Number(s.totalWeightKg),
      mode,
      reason: "",
      recognizedKg: "",
    });
    setActionError(null);
  };

  const submitReview = async () => {
    if (!review) return;
    setActionLoading(true);
    setActionError(null);
    try {
      let updated: ShipmentResponse;
      if (review.mode === "approve") {
        updated = await deliveryApiClient.approveByAdmin(review.shipmentId);
      } else {
        const isPartial = review.mode === "reject-partial";
        updated = await deliveryApiClient.rejectByAdmin({
          shipmentId: review.shipmentId,
          reason: review.reason.trim(),
          isPartial,
          recognizedKg: isPartial ? Number(review.recognizedKg) : undefined,
        });
      }
      setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setReview(null);
      setSuccessMsg(
        review.mode === "approve"
          ? "Shipment approved successfully!"
          : "Shipment rejected successfully!"
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const isReviewValid = () => {
    if (!review) return false;
    if (review.mode === "approve") return true;
    if (!review.reason.trim()) return false;
    if (review.mode === "reject-partial") {
      const kg = Number(review.recognizedKg);
      return kg > 0 && kg <= review.totalWeightKg;
    }
    return true;
  };

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

  const pendingCount = items.filter((s) => s.status === "DISETUJUI_MANDOR").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <header
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
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
            Shipments
          </h1>
          <p style={{ marginTop: 12, fontFamily: "'Lato', sans-serif", fontSize: 16, color: "#52443D" }}>
            Review and approve Mandor-verified deliveries
          </p>
        </div>
        {pendingCount > 0 && (
          <div
            style={{
              background: "rgba(187,115,84,0.12)",
              border: "1px solid rgba(187,115,84,0.3)",
              borderRadius: 12,
              padding: "12px 20px",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#854E31",
              marginTop: 8,
            }}
          >
            {pendingCount} awaiting review
          </div>
        )}
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
          disabled={loading}
          style={{ ...btnPrimary, height: 50, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
        <button
          type="button"
          onClick={() => { setStartDate(""); setEndDate(""); }}
          style={{ ...btnOutline, height: 50 }}
        >
          Clear Dates
        </button>
      </section>

      {/* Messages */}
      {error && (
        <div style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#BA1A1A" }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ background: "rgba(91,32,18,0.08)", border: "1px solid rgba(91,32,18,0.2)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#5B2012" }}>
          {successMsg}
        </div>
      )}

      {/* Review panel */}
      {review && (
        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
            borderRadius: 12,
            padding: 28,
            boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: "#5B2012", margin: 0 }}>
            {review.mode === "approve"
              ? "Confirm Approval"
              : review.mode === "reject-partial"
              ? "Partial Rejection"
              : "Full Rejection"}
          </h3>

          {review.mode === "approve" && (
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#52443D", margin: 0 }}>
              Approving this shipment will set recognized weight to the full{" "}
              <strong>{review.totalWeightKg.toLocaleString("id-ID")} kg</strong>.
            </p>
          )}

          {actionError && (
            <div style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#BA1A1A" }}>
              {actionError}
            </div>
          )}

          {(review.mode === "reject-full" || review.mode === "reject-partial") && (
            <div>
              <span style={labelStyle}>Rejection Reason *</span>
              <textarea
                value={review.reason}
                onChange={(e) => setReview((r) => r ? { ...r, reason: e.target.value } : r)}
                placeholder="Provide a reason for rejection..."
                rows={4}
                style={{
                  width: "100%",
                  border: "1px solid #DBC1B9",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 14,
                  color: "#1B1C1B",
                  resize: "vertical",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          )}

          {review.mode === "reject-partial" && (
            <div>
              <span style={labelStyle}>
                Recognized Weight (kg) * — max {review.totalWeightKg.toLocaleString("id-ID")} kg
              </span>
              <input
                type="number"
                value={review.recognizedKg}
                onChange={(e) => setReview((r) => r ? { ...r, recognizedKg: e.target.value } : r)}
                min={0.01}
                max={review.totalWeightKg}
                step={0.01}
                placeholder="e.g. 250"
                style={{ ...inputStyle, width: 220 }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              disabled={actionLoading || !isReviewValid()}
              onClick={() => void submitReview()}
              style={{
                ...btnPrimary,
                background: review.mode === "approve" ? "#BB7354" : "#6D2615",
                opacity: actionLoading || !isReviewValid() ? 0.5 : 1,
                cursor: actionLoading || !isReviewValid() ? "not-allowed" : "pointer",
              }}
            >
              {actionLoading
                ? "Processing..."
                : review.mode === "approve"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </button>
            <button
              type="button"
              onClick={() => { setReview(null); setActionError(null); }}
              style={btnOutline}
            >
              Cancel
            </button>
          </div>
        </section>
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
              <th style={colStyle}>Mandor</th>
              <th style={colStyle}>Driver</th>
              <th style={colStyle}>Weight (kg)</th>
              <th style={colStyle}>Status</th>
              <th style={colStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#53433D", borderTop: "none" }}>
                  Loading shipments...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#53433D", borderTop: "none" }}>
                  No shipments found for this date range
                </td>
              </tr>
            ) : (
              items.map((s) => {
                const isPending = s.status === "DISETUJUI_MANDOR";
                const isReviewing = review?.shipmentId === s.id;
                return (
                  <tr key={s.id} style={{ background: isReviewing ? "rgba(187,115,84,0.04)" : undefined }}>
                    <td style={cellStyle}>{formatDate(s.updatedAt || s.createdAt)}</td>
                    <td style={cellStyle}>
                      <span title={s.plantationId} style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#5B2012", background: "#EDE8E4", borderRadius: 4, padding: "2px 6px" }}>
                        {shortId(s.plantationId)}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <span title={s.mandorId} style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#5B2012", background: "#EDE8E4", borderRadius: 4, padding: "2px 6px" }}>
                        {shortId(s.mandorId)}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <span title={s.driverId ?? ""} style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#5B2012", background: "#EDE8E4", borderRadius: 4, padding: "2px 6px" }}>
                        {shortId(s.driverId)}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, fontWeight: 700, color: "#5B2012" }}>
                      {Number(s.totalWeightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                      {s.recognizedWeightKg != null && s.recognizedWeightKg !== s.totalWeightKg && (
                        <div style={{ fontWeight: 400, fontSize: 12, color: "#854E31" }}>
                          Recognized: {Number(s.recognizedWeightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg
                        </div>
                      )}
                    </td>
                    <td style={cellStyle}>
                      <ShipmentStatusBadge status={s.status} />
                      {s.rejectionReason && (
                        <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#BA1A1A", marginTop: 4, maxWidth: 200 }}>
                          {s.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={cellStyle}>
                      {isPending && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => openReview(s, "approve")}
                            style={{
                              background: "#BB7354",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "6px 12px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 11,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openReview(s, "reject-partial")}
                            style={{
                              background: "#8A4B2F",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "6px 12px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 11,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Partial
                          </button>
                          <button
                            type="button"
                            onClick={() => openReview(s, "reject-full")}
                            style={{
                              background: "#6D2615",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "6px 12px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 11,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
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
          {loading ? "Loading..." : `${items.length} record${items.length === 1 ? "" : "s"} — ${pendingCount} pending review`}
        </div>
      </section>
    </div>
  );
}
