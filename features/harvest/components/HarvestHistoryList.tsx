"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/dashboard/DashboardComponents";
import { harvestHistoryClient } from "@/features/harvest/historyApi";
import type {
  HarvestHistoryItem,
  HarvestStatus,
} from "@/features/harvest/historyTypes";

const statusOptions: Array<HarvestStatus | ""> = ["", "PENDING", "APPROVED", "REJECTED"];

function displayDate(item: HarvestHistoryItem) {
  const value = item.harvestDate || item.createdAt || item.submittedAt;
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayWeight(weight: number) {
  return `${Number(weight).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })} kg`;
}

interface HarvestHistoryListProps {
  title?: string;
  emptyLabel?: string;
  initialStatus?: HarvestStatus | "";
  showBuruhColumn?: boolean;
}

export default function HarvestHistoryList({
  title = "My Harvests",
  emptyLabel = "No harvest submissions found.",
  initialStatus = "",
  showBuruhColumn = false,
}: HarvestHistoryListProps) {
  const [items, setItems] = useState<HarvestHistoryItem[]>([]);
  const [status, setStatus] = useState<HarvestStatus | "">(initialStatus);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectText, setRejectText] = useState<string>("");
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);

  const canGoBack = page > 0;
  const canGoNext = page + 1 < totalPages;

  const subtitle = useMemo(() => {
    if (loading) return "Loading harvest submissions...";
    if (totalElements === 0) return "No harvest submissions found.";
    return `${totalElements.toLocaleString("id-ID")} harvest submission${totalElements === 1 ? "" : "s"} found.`;
  }, [loading, totalElements]);

  const reload = useCallback(() => {
    setPage(0);
    setStatus(initialStatus);
  }, [initialStatus]);

  const approve = useCallback(async (harvestId: string) => {
    setReviewingId(harvestId);
    setError(null);
    try {
      await harvestHistoryClient.approveHarvest(harvestId);
      setItems((prev) => prev.filter((item) => item.id !== harvestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve harvest.");
    } finally {
      setReviewingId(null);
    }
  }, []);

  const reject = useCallback(async (harvestId: string, reason: string) => {
    setReviewingId(harvestId);
    setError(null);
    try {
      await harvestHistoryClient.rejectHarvest(harvestId, reason);
      setItems((prev) => prev.filter((item) => item.id !== harvestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject harvest.");
    } finally {
      setReviewingId(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadHarvests() {
      setLoading(true);
      setError(null);
      try {
        const response = await harvestHistoryClient.getHarvestHistory({
          page,
          size: 10,
          status,
        });
        if (!active) return;
        setItems(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load harvest submissions.");
        setItems([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadHarvests();

    return () => {
      active = false;
    };
  }, [page, status]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 50,
              color: "#5B2012",
              lineHeight: 1.05,
            }}
          >
                  {title}
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
            {subtitle}
          </p>
        </div>
      </header>

      <section
        className="flex flex-wrap items-end gap-4"
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
          padding: 28,
        }}
      >
        <label className="flex flex-col gap-2">
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "#52443D",
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            Status
          </span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as HarvestStatus | "");
              setPage(0);
            }}
            style={{
              height: 50,
              minWidth: 220,
              background: "#FFFFFF",
              border: "1px solid #DBC1B9",
              borderRadius: 12,
              padding: "0 16px",
              fontFamily: "'Lato', sans-serif",
              fontSize: 16,
              color: "#1B1C1B",
            }}
          >
            {statusOptions.map((option) => (
              <option key={option || "ALL"} value={option}>
                {option || "ALL STATUS"}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setStatus("");
            setPage(0);
          }}
        >
          Reset Filters
        </Button>
      </section>

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

      <section
        className="overflow-hidden"
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F6F3F1", borderBottom: "1px solid #DBC1B9" }}>
            {[
              ...(showBuruhColumn ? ["BURUH"] : []),
              "DATE",
              "WEIGHT",
              "NOTES",
              "STATUS",
              "REVIEW",
            ].map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#52443D",
                    letterSpacing: 0.7,
                  }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={showBuruhColumn ? 6 : 5} className="px-6 py-10 text-center" style={{ color: "#53433D" }}>
                  Loading harvest submissions...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={showBuruhColumn ? 6 : 5} className="px-6 py-10 text-center" style={{ color: "#53433D" }}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid #DBC1B9" }}>
                  {showBuruhColumn && (
                    <td className="px-6 py-4" style={{ color: "#1B1C1B", fontWeight: 600 }}>
                      {item.buruhName || item.buruhId}
                    </td>
                  )}
                  <td className="px-6 py-4" style={{ color: "#1B1C1B" }}>
                    {displayDate(item)}
                  </td>
                  <td className="px-6 py-4" style={{ color: "#5B2012", fontWeight: 700 }}>
                    {displayWeight(item.weightKg)}
                  </td>
                  <td className="max-w-[360px] px-6 py-4" style={{ color: "#1B1C1B" }}>
                    <span className="line-clamp-2">{item.notes || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge label={item.status} />
                  </td>
                  <td className="px-6 py-4" style={{ color: "#53433D" }}>
                    {item.rejectionReason ? (
                      item.rejectionReason
                    ) : item.reviewedAt ? (
                      "Reviewed"
                    ) : showBuruhColumn && item.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={reviewingId === item.id}
                          onClick={() => approve(item.id)}
                          style={{
                            background: "#647d46",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            padding: "6px 16px",
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: reviewingId === item.id ? "not-allowed" : "pointer",
                            opacity: reviewingId === item.id ? 0.6 : 1,
                          }}
                        >
                          {reviewingId === item.id ? "..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={reviewingId === item.id}
                          onClick={() => setRejectDialog(item.id)}
                          style={{
                            background: "#6d2615",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            padding: "6px 16px",
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: reviewingId === item.id ? "not-allowed" : "pointer",
                            opacity: reviewingId === item.id ? 0.6 : 1,
                          }}
                        >
                          {reviewingId === item.id ? "..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      "Waiting"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid #DBC1B9" }}
        >
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#52443D" }}>
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={!canGoBack || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canGoNext || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      {rejectDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => { setRejectDialog(null); setRejectText(""); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 480,
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#5B2012",
                marginBottom: 8,
              }}
            >
              Reject Harvest
            </h2>
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                color: "#52443D",
                marginBottom: 20,
              }}
            >
              Provide a reason for rejecting this harvest submission.
            </p>
            <textarea
              value={rejectText}
              onChange={(e) => setRejectText(e.target.value)}
              placeholder="Rejection reason..."
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
                marginBottom: 20,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setRejectDialog(null); setRejectText(""); }}
                style={{
                  background: "transparent",
                  border: "1px solid #DBC1B9",
                  borderRadius: 20,
                  padding: "8px 24px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#52443D",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectText.trim() || reviewingId === rejectDialog}
                onClick={() => {
                  if (rejectText.trim()) {
                    reject(rejectDialog, rejectText.trim());
                    setRejectDialog(null);
                    setRejectText("");
                  }
                }}
                style={{
                  background: "#6d2615",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  padding: "8px 24px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: !rejectText.trim() || reviewingId === rejectDialog ? "not-allowed" : "pointer",
                  opacity: !rejectText.trim() || reviewingId === rejectDialog ? 0.6 : 1,
                }}
              >
                {reviewingId === rejectDialog ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
