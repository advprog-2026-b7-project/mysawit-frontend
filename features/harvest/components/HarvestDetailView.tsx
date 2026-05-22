"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { harvestHistoryClient } from "@/features/harvest/historyApi";
import type { HarvestHistoryItem } from "@/features/harvest/historyTypes";
import { getMe, type MeResponse } from "@/features/admin/api";
import HarvestStatusBadge from "./HarvestStatusBadge";

// Extended view type that includes approval/rejection metadata
// which the backend may return but is not yet captured in the base type.
interface HarvestDetailItem extends HarvestHistoryItem {
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

interface HarvestDetailViewProps {
  id: string;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTimestamp(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  color: "#52443D",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  display: "block",
  marginBottom: 4,
};

const fieldValueStyle: React.CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 400,
  fontSize: 16,
  color: "#1B1C1B",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #DBC1B9",
  borderRadius: 12,
  boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
  padding: 32,
  marginBottom: 24,
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 16,
  color: "#5B2012",
  marginTop: 0,
  marginBottom: 20,
};

export default function HarvestDetailView({ id }: HarvestDetailViewProps) {
  const [harvest, setHarvest] = useState<HarvestDetailItem | null>(null);
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewingAction, setReviewingAction] = useState<"approve" | "reject" | null>(null);
  const [rejectExpanded, setRejectExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The /api/v1/harvests/{id} endpoint may not exist yet.
      // We fetch the list and find by id as a fallback approach,
      // but first try to get via list with a broad query.
      // Since there is no direct getById in historyApi, we fetch from the list.
      const response = await harvestHistoryClient.getHarvestHistory({ size: 200 });
      const found = response.content.find((item) => item.id === id);
      if (!found) {
        // Try fetching with status filters to increase coverage
        const statuses = ["PENDING", "APPROVED", "REJECTED"] as const;
        let located: HarvestDetailItem | null = null;
        for (const st of statuses) {
          if (located) break;
          try {
            const r = await harvestHistoryClient.getHarvestHistory({ status: st, size: 200 });
            const match = r.content.find((item) => item.id === id);
            if (match) located = match as HarvestDetailItem;
          } catch {
            // ignore per-status errors
          }
        }
        if (located) {
          setHarvest(located);
        } else {
          setError("Harvest record not found.");
        }
      } else {
        setHarvest(found as HarvestDetailItem);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load harvest record.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    getMe()
      .then((me) => setCurrentUser(me))
      .catch(() => undefined);
  }, [load]);

  const handleApprove = async () => {
    setReviewingAction("approve");
    setActionError(null);
    try {
      const approveResult = await harvestHistoryClient.approveHarvest(id);
      setHarvest((prev) =>
        prev
          ? {
              ...prev,
              status: "APPROVED",
              approvedBy: approveResult.approvedBy,
              approvedAt: approveResult.approvedAt,
            }
          : prev
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve harvest.");
    } finally {
      setReviewingAction(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setReviewingAction("reject");
    setActionError(null);
    try {
      const result = await harvestHistoryClient.rejectHarvest(id, rejectReason.trim());
      setHarvest((prev) =>
        prev
          ? {
              ...prev,
              status: "REJECTED",
              rejectionReason: result.rejectionReason,
              rejectedBy: result.rejectedBy,
              rejectedAt: result.rejectedAt,
            }
          : prev
      );
      setRejectExpanded(false);
      setRejectReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject harvest.");
    } finally {
      setReviewingAction(null);
    }
  };

  const isMandor = currentUser?.role === "MANDOR";

  if (loading) {
    return (
      <div
        style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 16,
          color: "#53433D",
          padding: 40,
        }}
      >
        Loading harvest record...
      </div>
    );
  }

  if (error || !harvest) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/admin/harvests"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#854E31",
              textDecoration: "none",
            }}
          >
            ← Back to Harvests
          </Link>
        </div>
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
          {error ?? "Harvest record not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/admin/harvests"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#854E31",
            textDecoration: "none",
          }}
        >
          ← Back to Harvests
        </Link>
      </div>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
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
          {harvest.buruhName || "Harvest Detail"}
        </h1>
        <p
          style={{
            marginTop: 12,
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#53433D",
          }}
        >
          Harvest record details and approval status
        </p>
      </div>

      {/* Action error */}
      {actionError && (
        <div
          style={{
            background: "rgba(186,26,26,0.08)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#BA1A1A",
          }}
        >
          {actionError}
        </div>
      )}

      {/* Main info card */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Harvest Information</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 28,
          }}
        >
          {/* Harvest ID */}
          <div>
            <span style={fieldLabelStyle}>Harvest ID</span>
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontWeight: 400,
                fontSize: 13,
                color: "#5B2012",
                background: "#EDE8E4",
                borderRadius: 6,
                padding: "3px 8px",
                display: "inline-block",
                wordBreak: "break-all",
              }}
            >
              {harvest.id}
            </span>
          </div>

          {/* Status */}
          <div>
            <span style={fieldLabelStyle}>Status</span>
            <HarvestStatusBadge status={harvest.status} />
          </div>

          {/* Harvest Date */}
          <div>
            <span style={fieldLabelStyle}>Harvest Date</span>
            <span style={fieldValueStyle}>
              {formatDate(harvest.harvestDate || harvest.createdAt)}
            </span>
          </div>

          {/* Created At */}
          <div>
            <span style={fieldLabelStyle}>Submitted At</span>
            <span style={fieldValueStyle}>
              {formatTimestamp(harvest.submittedAt || harvest.createdAt)}
            </span>
          </div>

          {/* Buruh ID */}
          <div>
            <span style={fieldLabelStyle}>Buruh ID</span>
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontWeight: 400,
                fontSize: 13,
                color: "#5B2012",
                background: "#EDE8E4",
                borderRadius: 6,
                padding: "3px 8px",
                display: "inline-block",
                wordBreak: "break-all",
              }}
            >
              {harvest.buruhId}
            </span>
          </div>

          {/* Buruh Name */}
          <div>
            <span style={fieldLabelStyle}>Buruh Name</span>
            <span style={fieldValueStyle}>{harvest.buruhName || "—"}</span>
          </div>

          {/* Plantation ID */}
          {harvest.plantationId && (
            <div>
              <span style={fieldLabelStyle}>Plantation ID</span>
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 400,
                  fontSize: 13,
                  color: "#5B2012",
                  background: "#EDE8E4",
                  borderRadius: 6,
                  padding: "3px 8px",
                  display: "inline-block",
                  wordBreak: "break-all",
                }}
              >
                {harvest.plantationId}
              </span>
            </div>
          )}

          {/* Weight */}
          <div>
            <span style={fieldLabelStyle}>Weight</span>
            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#5B2012",
              }}
            >
              {Number(harvest.weightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg
            </span>
          </div>

          {/* Notes */}
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={fieldLabelStyle}>Notes</span>
            <span style={fieldValueStyle}>{harvest.notes || "—"}</span>
          </div>
        </div>
      </div>

      {/* Approved info */}
      {harvest.status === "APPROVED" && (harvest.approvedBy || harvest.approvedAt || harvest.reviewedAt) && (
        <div style={cardStyle}>
          <h2 style={{ ...sectionHeadingStyle, color: "#5B2012" }}>Approval Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {harvest.approvedBy && (
              <div>
                <span style={fieldLabelStyle}>Approved By</span>
                <span style={fieldValueStyle}>{harvest.approvedBy}</span>
              </div>
            )}
            {(harvest.approvedAt || harvest.reviewedAt) && (
              <div>
                <span style={fieldLabelStyle}>Approved At</span>
                <span style={fieldValueStyle}>
                  {formatTimestamp(harvest.approvedAt || harvest.reviewedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejected info */}
      {harvest.status === "REJECTED" && (
        <div
          style={{
            background: "rgba(186,26,26,0.04)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 12,
            boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
            padding: 32,
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              ...sectionHeadingStyle,
              color: "#BA1A1A",
            }}
          >
            Rejection Details
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {harvest.rejectedBy && (
              <div>
                <span style={fieldLabelStyle}>Rejected By</span>
                <span style={fieldValueStyle}>{harvest.rejectedBy}</span>
              </div>
            )}
            {(harvest.rejectedAt || harvest.reviewedAt) && (
              <div>
                <span style={fieldLabelStyle}>Rejected At</span>
                <span style={fieldValueStyle}>
                  {formatTimestamp(harvest.rejectedAt || harvest.reviewedAt)}
                </span>
              </div>
            )}
            {harvest.rejectionReason && (
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={fieldLabelStyle}>Rejection Reason</span>
                <span
                  style={{
                    ...fieldValueStyle,
                    color: "#BA1A1A",
                  }}
                >
                  {harvest.rejectionReason}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photos section */}
      {harvest.photoUrls && harvest.photoUrls.length > 0 && (
        <div style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Photos</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {harvest.photoUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  src={url}
                  alt={`Harvest photo ${index + 1}`}
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #DBC1B9",
                    display: "block",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mandor actions */}
      {isMandor && harvest.status === "PENDING" && (
        <div style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Review Actions</h2>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={reviewingAction !== null}
              onClick={() => void handleApprove()}
              style={{
                background: "#BB7354",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 9999,
                padding: "12px 32px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: reviewingAction !== null ? "not-allowed" : "pointer",
                opacity: reviewingAction !== null ? 0.5 : 1,
              }}
            >
              {reviewingAction === "approve" ? "Approving..." : "Approve Harvest"}
            </button>

            <button
              type="button"
              disabled={reviewingAction !== null}
              onClick={() => {
                setRejectExpanded((prev) => !prev);
                setRejectReason("");
              }}
              style={{
                background: "#FFFFFF",
                border: "1px solid #DBC1B9",
                borderRadius: 9999,
                padding: "12px 32px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#BA1A1A",
                cursor: reviewingAction !== null ? "not-allowed" : "pointer",
                opacity: reviewingAction !== null ? 0.5 : 1,
              }}
            >
              Reject Harvest
            </button>
          </div>

          {/* Inline rejection expansion */}
          {rejectExpanded && (
            <div
              style={{
                marginTop: 20,
                padding: 20,
                background: "#FAF6F3",
                border: "1px solid #DBC1B9",
                borderRadius: 12,
                maxWidth: 560,
              }}
            >
              <p
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#52443D",
                  marginTop: 0,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                Rejection Reason
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejecting this harvest submission..."
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
                  marginBottom: 16,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#BB7354";
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(187,115,84,0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DBC1B9";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => { setRejectExpanded(false); setRejectReason(""); }}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #DBC1B9",
                    borderRadius: 9999,
                    padding: "10px 24px",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#5B2012",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectReason.trim() || reviewingAction !== null}
                  onClick={() => void handleReject()}
                  style={{
                    background: "#6D2615",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 9999,
                    padding: "10px 24px",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: !rejectReason.trim() || reviewingAction !== null ? "not-allowed" : "pointer",
                    opacity: !rejectReason.trim() || reviewingAction !== null ? 0.5 : 1,
                  }}
                >
                  {reviewingAction === "reject" ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
