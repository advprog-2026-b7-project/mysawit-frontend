"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { harvestHistoryClient } from "@/features/harvest/historyApi";
import type { HarvestHistoryItem, HarvestStatus } from "@/features/harvest/historyTypes";
import HarvestStatusBadge from "./HarvestStatusBadge";
import type { MeResponse } from "@/features/admin/api";
import { getMe } from "@/features/admin/api";

const statusOptions: Array<{ value: HarvestStatus | ""; label: string }> = [
  { value: "", label: "ALL" },
  { value: "PENDING", label: "PENDING" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" },
];

function formatHarvestDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
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

export default function HarvestList() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null);

  const [items, setItems] = useState<HarvestHistoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<HarvestStatus | "">("");
  const [buruhName, setBuruhName] = useState("");

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectOpenId, setRejectOpenId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const buruhNameDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedBuruhName, setDebouncedBuruhName] = useState("");

  useEffect(() => {
    getMe()
      .then((me) => setCurrentUser(me))
      .catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await harvestHistoryClient.getHarvestHistory({
        page,
        size: 15,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        buruhName: debouncedBuruhName || undefined,
      });
      setItems(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load harvest records.");
      setItems([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, status, startDate, endDate, debouncedBuruhName]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBuruhNameChange = (val: string) => {
    setBuruhName(val);
    if (buruhNameDebounce.current) clearTimeout(buruhNameDebounce.current);
    buruhNameDebounce.current = setTimeout(() => {
      setDebouncedBuruhName(val);
      setPage(0);
    }, 350);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStatus("");
    setBuruhName("");
    setDebouncedBuruhName("");
    setPage(0);
  };

  const approve = useCallback(
    async (harvestId: string) => {
      setReviewingId(harvestId);
      setActionError(null);
      try {
        await harvestHistoryClient.approveHarvest(harvestId);
        setItems((prev) =>
          prev.map((item) =>
            item.id === harvestId ? { ...item, status: "APPROVED" } : item
          )
        );
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to approve harvest.");
      } finally {
        setReviewingId(null);
      }
    },
    []
  );

  const reject = useCallback(
    async (harvestId: string, reason: string) => {
      setReviewingId(harvestId);
      setActionError(null);
      try {
        await harvestHistoryClient.rejectHarvest(harvestId, reason);
        setItems((prev) =>
          prev.map((item) =>
            item.id === harvestId
              ? { ...item, status: "REJECTED", rejectionReason: reason }
              : item
          )
        );
        setRejectOpenId(null);
        setRejectReason("");
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to reject harvest.");
      } finally {
        setReviewingId(null);
      }
    },
    []
  );

  const isMandor = currentUser?.role === "MANDOR";
  const canGoBack = page > 0;
  const canGoNext = page + 1 < totalPages;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
            Harvests
          </h1>
          <p
            style={{
              marginTop: 12,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "#52443D",
            }}
          >
            Manage harvest records and approvals
          </p>
        </div>
      </header>

      {/* Filter card */}
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
            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
            style={{ ...inputStyle, width: 180 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
            style={{ ...inputStyle, width: 180 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>Status</span>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as HarvestStatus | ""); setPage(0); }}
            style={{ ...inputStyle, width: 180 }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value || "ALL"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>Buruh Name</span>
          <input
            type="text"
            value={buruhName}
            onChange={(e) => handleBuruhNameChange(e.target.value)}
            placeholder="Search by name..."
            style={{ ...inputStyle, width: 220 }}
          />
        </label>

        <button
          type="button"
          onClick={handleReset}
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
            borderRadius: 9999,
            padding: "12px 28px",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#5B2012",
            cursor: "pointer",
          }}
        >
          Reset Filters
        </button>
      </section>

      {/* Error banners */}
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
      {actionError && (
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
          {actionError}
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
              {["DATE", "BURUH NAME", "WEIGHT (KG)", "STATUS", "PHOTOS", "ACTIONS"].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "14px 20px",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#52443D",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    textAlign: "left",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 16,
                    color: "#53433D",
                  }}
                >
                  Loading harvest records...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 16,
                    color: "#53433D",
                  }}
                >
                  No harvest records found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid #DBC1B9" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        color: "#1B1C1B",
                      }}
                    >
                      {formatHarvestDate(item.harvestDate || item.createdAt)}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#1B1C1B",
                      }}
                    >
                      {item.buruhName || item.buruhId}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#5B2012",
                      }}
                    >
                      {Number(item.weightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <HarvestStatusBadge status={item.status} />
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 14,
                        color: "#53433D",
                      }}
                    >
                      {item.photoUrls && item.photoUrls.length > 0
                        ? `${item.photoUrls.length} photo${item.photoUrls.length === 1 ? "" : "s"}`
                        : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/harvests/${item.id}`)}
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#854E31",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        View →
                      </button>
                      {isMandor && item.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            disabled={reviewingId === item.id}
                            onClick={() => void approve(item.id)}
                            style={{
                              background: "#BB7354",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "6px 14px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: reviewingId === item.id ? "not-allowed" : "pointer",
                              opacity: reviewingId === item.id ? 0.5 : 1,
                            }}
                          >
                            {reviewingId === item.id ? "..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === item.id}
                            onClick={() => {
                              setRejectOpenId(rejectOpenId === item.id ? null : item.id);
                              setRejectReason("");
                            }}
                            style={{
                              background: "#6D2615",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "6px 14px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: reviewingId === item.id ? "not-allowed" : "pointer",
                              opacity: reviewingId === item.id ? 0.5 : 1,
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                    {/* Inline reject expansion */}
                    {rejectOpenId === item.id && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 16,
                          background: "#FAF6F3",
                          border: "1px solid #DBC1B9",
                          borderRadius: 12,
                          minWidth: 280,
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Lato', sans-serif",
                            fontSize: 13,
                            color: "#52443D",
                            marginTop: 0,
                            marginBottom: 8,
                          }}
                        >
                          Provide a rejection reason:
                        </p>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          rows={3}
                          style={{
                            width: "100%",
                            border: "1px solid #DBC1B9",
                            borderRadius: 8,
                            padding: "10px 12px",
                            fontFamily: "'Lato', sans-serif",
                            fontSize: 14,
                            color: "#1B1C1B",
                            resize: "vertical",
                            boxSizing: "border-box",
                            marginBottom: 10,
                          }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => { setRejectOpenId(null); setRejectReason(""); }}
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid #DBC1B9",
                              borderRadius: 9999,
                              padding: "7px 16px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 12,
                              color: "#5B2012",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!rejectReason.trim() || reviewingId === item.id}
                            onClick={() => {
                              if (rejectReason.trim()) {
                                void reject(item.id, rejectReason.trim());
                              }
                            }}
                            style={{
                              background: "#6D2615",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "7px 16px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: !rejectReason.trim() || reviewingId === item.id ? "not-allowed" : "pointer",
                              opacity: !rejectReason.trim() || reviewingId === item.id ? 0.5 : 1,
                            }}
                          >
                            {reviewingId === item.id ? "Rejecting..." : "Confirm Rejection"}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderTop: "1px solid #DBC1B9",
          }}
        >
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              color: "#52443D",
              margin: 0,
            }}
          >
            {loading
              ? "Loading..."
              : `${totalElements.toLocaleString()} record${totalElements === 1 ? "" : "s"} — Page ${totalPages === 0 ? 0 : page + 1} of ${totalPages}`}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              disabled={!canGoBack || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              style={{
                background: "#FFFFFF",
                border: "1px solid #DBC1B9",
                borderRadius: 9999,
                padding: "10px 24px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#5B2012",
                cursor: !canGoBack || loading ? "not-allowed" : "pointer",
                opacity: !canGoBack || loading ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!canGoNext || loading}
              onClick={() => setPage((p) => p + 1)}
              style={{
                background: "#FFFFFF",
                border: "1px solid #DBC1B9",
                borderRadius: 9999,
                padding: "10px 24px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#5B2012",
                cursor: !canGoNext || loading ? "not-allowed" : "pointer",
                opacity: !canGoNext || loading ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
