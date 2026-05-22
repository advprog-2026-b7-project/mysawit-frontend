"use client";

import { useCallback, useEffect, useState } from "react";
import { deliveryApiClient } from "@/features/delivery/deliveryApi";
import { harvestHistoryClient } from "@/features/harvest/historyApi";
import type { ShipmentResponse, DriverItem } from "@/features/delivery/deliveryTypes";
import type { HarvestHistoryItem } from "@/features/harvest/historyTypes";
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
  background: "#FFFFFF",
  border: "1px solid #DBC1B9",
  borderRadius: 12,
  padding: "12px 16px",
  fontFamily: "'Lato', sans-serif",
  fontSize: 14,
  color: "#1B1C1B",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
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

// ─── Create Shipment inline form ─────────────────────────────────────────────

interface CreateFormProps {
  plantationId: string;
  onCreated: (s: ShipmentResponse) => void;
  onCancel: () => void;
}

function CreateShipmentForm({ plantationId, onCreated, onCancel }: CreateFormProps) {
  const [harvests, setHarvests] = useState<HarvestHistoryItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [selectedHarvestIds, setSelectedHarvestIds] = useState<Set<string>>(new Set());
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      setLoadingData(true);
      setLoadError(null);
      try {
        const [harvestPage, driverList] = await Promise.all([
          harvestHistoryClient.getHarvestHistory({ status: "APPROVED", size: 100 }),
          deliveryApiClient.getAvailableDrivers(plantationId),
        ]);
        if (!active) return;
        setHarvests(harvestPage.content);
        setDrivers(driverList);
      } catch (e) {
        if (!active) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load form data.");
      } finally {
        if (active) setLoadingData(false);
      }
    }
    void fetchData();
    return () => { active = false; };
  }, [plantationId]);

  const toggleHarvest = (id: string) => {
    setSelectedHarvestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalSelected = harvests
    .filter((h) => selectedHarvestIds.has(h.id))
    .reduce((sum, h) => sum + Number(h.weightKg), 0);

  const handleSubmit = async () => {
    if (selectedHarvestIds.size === 0 || !selectedDriverId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await deliveryApiClient.createShipment({
        harvestIds: Array.from(selectedHarvestIds),
        driverId: selectedDriverId,
      });
      onCreated(created);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create shipment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ padding: "24px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#52443D" }}>
        Loading available harvests and drivers...
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            background: "rgba(186,26,26,0.08)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#BA1A1A",
            marginBottom: 16,
          }}
        >
          {loadError}
        </div>
        <button type="button" onClick={onCancel} style={btnOutline}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
      <h3
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 20,
          color: "#5B2012",
          margin: 0,
        }}
      >
        Create New Shipment
      </h3>

      {submitError && (
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
          {submitError}
        </div>
      )}

      {/* Harvest picker */}
      <div>
        <span style={labelStyle}>
          Select Approved Harvests
          {selectedHarvestIds.size > 0 && (
            <span style={{ color: "#BB7354", marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
              ({selectedHarvestIds.size} selected · {totalSelected.toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg total)
            </span>
          )}
        </span>
        {harvests.length === 0 ? (
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#52443D", margin: 0 }}>
            No approved harvests available
          </p>
        ) : (
          <div
            style={{
              border: "1px solid #DBC1B9",
              borderRadius: 12,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {harvests.map((h, idx) => {
              const checked = selectedHarvestIds.has(h.id);
              return (
                <label
                  key={h.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: checked ? "rgba(187,115,84,0.06)" : "#FFFFFF",
                    borderBottom: idx < harvests.length - 1 ? "1px solid #DBC1B9" : "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleHarvest(h.id)}
                    style={{ width: 16, height: 16, accentColor: "#BB7354" }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#1B1C1B",
                      }}
                    >
                      {h.buruhName || shortId(h.buruhId)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 13,
                        color: "#52443D",
                        marginLeft: 8,
                      }}
                    >
                      {formatDate(h.harvestDate || h.createdAt)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#5B2012",
                    }}
                  >
                    {Number(h.weightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Driver picker */}
      <div>
        <span style={labelStyle}>Select Driver</span>
        {drivers.length === 0 ? (
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#52443D", margin: 0 }}>
            No drivers available for your plantation
          </p>
        ) : (
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            style={{ ...inputStyle, height: 50, padding: "0 16px" }}
          >
            <option value="">— Select a driver —</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || shortId(d.id)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting || selectedHarvestIds.size === 0 || !selectedDriverId}
          style={{
            ...btnPrimary,
            opacity: submitting || selectedHarvestIds.size === 0 || !selectedDriverId ? 0.5 : 1,
            cursor: submitting || selectedHarvestIds.size === 0 || !selectedDriverId ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Creating..." : "Create Shipment"}
        </button>
        <button type="button" onClick={onCancel} style={btnOutline}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MandorShipmentList() {
  const [items, setItems] = useState<ShipmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectOpenId, setRejectOpenId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [plantationId, setPlantationId] = useState<string | null>(null);
  const [plantationError, setPlantationError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApiClient.getMyOngoing();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load shipments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = useCallback(async () => {
    setPlantationError(null);
    if (!plantationId) {
      try {
        const pid = await deliveryApiClient.getMyPlantationId();
        setPlantationId(pid);
      } catch (e) {
        setPlantationError(e instanceof Error ? e.message : "Could not load plantation info.");
        return;
      }
    }
    setShowCreate(true);
  }, [plantationId]);

  const handleCreated = useCallback((s: ShipmentResponse) => {
    setItems((prev) => [s, ...prev]);
    setShowCreate(false);
    setSuccessMsg("Shipment created successfully!");
    setTimeout(() => setSuccessMsg(null), 4000);
  }, []);

  const approve = useCallback(async (id: string) => {
    setReviewingId(id);
    setActionError(null);
    try {
      const updated = await deliveryApiClient.approveByMandor(id);
      setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to approve shipment.");
    } finally {
      setReviewingId(null);
    }
  }, []);

  const reject = useCallback(async (id: string, reason: string) => {
    setReviewingId(id);
    setActionError(null);
    try {
      const updated = await deliveryApiClient.rejectByMandor(id, reason);
      setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setRejectOpenId(null);
      setRejectReason("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to reject shipment.");
    } finally {
      setReviewingId(null);
    }
  }, []);

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
          <p
            style={{
              marginTop: 12,
              fontFamily: "'Lato', sans-serif",
              fontSize: 16,
              color: "#52443D",
            }}
          >
            Monitor and manage your plantation&apos;s ongoing deliveries
          </p>
        </div>
        <button
          type="button"
          onClick={() => void openCreate()}
          style={{ ...btnPrimary, marginTop: 8 }}
        >
          + New Shipment
        </button>
      </header>

      {/* Messages */}
      {plantationError && (
        <div style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#BA1A1A" }}>
          {plantationError}
        </div>
      )}
      {successMsg && (
        <div style={{ background: "rgba(91,32,18,0.08)", border: "1px solid rgba(91,32,18,0.2)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#5B2012" }}>
          {successMsg}
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#BA1A1A" }}>
          {error}
        </div>
      )}
      {actionError && (
        <div style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#BA1A1A" }}>
          {actionError}
        </div>
      )}

      {/* Create form */}
      {showCreate && plantationId && (
        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
            borderRadius: 12,
            boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
          }}
        >
          <CreateShipmentForm
            plantationId={plantationId}
            onCreated={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
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
              <th style={colStyle}>Driver</th>
              <th style={colStyle}>Weight (kg)</th>
              <th style={colStyle}>Harvests</th>
              <th style={colStyle}>Status</th>
              <th style={colStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#53433D", borderTop: "none" }}>
                  Loading shipments...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#53433D", borderTop: "none" }}>
                  No ongoing shipments
                </td>
              </tr>
            ) : (
              items.map((s) => {
                const canReview = s.status === "TIBA_DI_TUJUAN";
                return (
                  <tr key={s.id}>
                    <td style={cellStyle}>{formatDate(s.createdAt)}</td>
                    <td style={cellStyle}>
                      <span title={s.driverId ?? ""} style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#5B2012", background: "#EDE8E4", borderRadius: 4, padding: "2px 6px" }}>
                        {shortId(s.driverId)}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, fontWeight: 700, color: "#5B2012" }}>
                      {Number(s.totalWeightKg).toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                    </td>
                    <td style={cellStyle}>
                      {s.harvestIds?.length
                        ? `${s.harvestIds.length} harvest${s.harvestIds.length > 1 ? "s" : ""}`
                        : "—"}
                    </td>
                    <td style={cellStyle}>
                      <ShipmentStatusBadge status={s.status} />
                    </td>
                    <td style={cellStyle}>
                      {canReview && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            disabled={reviewingId === s.id}
                            onClick={() => void approve(s.id)}
                            style={{
                              background: "#BB7354",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "6px 14px",
                              fontFamily: "'Lato', sans-serif",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: reviewingId === s.id ? "not-allowed" : "pointer",
                              opacity: reviewingId === s.id ? 0.5 : 1,
                            }}
                          >
                            {reviewingId === s.id ? "..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === s.id}
                            onClick={() => {
                              setRejectOpenId(rejectOpenId === s.id ? null : s.id);
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
                              cursor: reviewingId === s.id ? "not-allowed" : "pointer",
                              opacity: reviewingId === s.id ? 0.5 : 1,
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Inline reject */}
                      {rejectOpenId === s.id && (
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
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#52443D", marginTop: 0, marginBottom: 8 }}>
                            Rejection reason:
                          </p>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter reason..."
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
                              outline: "none",
                            }}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => { setRejectOpenId(null); setRejectReason(""); }}
                              style={{ ...btnOutline, padding: "7px 16px", fontSize: 12 }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!rejectReason.trim() || reviewingId === s.id}
                              onClick={() => { if (rejectReason.trim()) void reject(s.id, rejectReason.trim()); }}
                              style={{
                                background: "#6D2615",
                                color: "#fff",
                                border: "none",
                                borderRadius: 9999,
                                padding: "7px 16px",
                                fontFamily: "'Lato', sans-serif",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: !rejectReason.trim() || reviewingId === s.id ? "not-allowed" : "pointer",
                                opacity: !rejectReason.trim() || reviewingId === s.id ? 0.5 : 1,
                              }}
                            >
                              {reviewingId === s.id ? "Rejecting..." : "Confirm"}
                            </button>
                          </div>
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
          {loading ? "Loading..." : `${items.length} ongoing shipment${items.length === 1 ? "" : "s"}`}
        </div>
      </section>
    </div>
  );
}
