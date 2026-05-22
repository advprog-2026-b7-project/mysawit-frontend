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
  marginBottom: 4,
};

const TH = "padding: 14px 20px; font-family: 'Lato'; font-weight: 700; font-size: 14px; color: #52443D; text-transform: uppercase; letter-spacing: 0.7px; text-align: left;";
void TH;

export default function SupirShipmentList() {
  const [items, setItems] = useState<ShipmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApiClient.getMyAssigned();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load shipments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const advanceStatus = useCallback(async (shipment: ShipmentResponse) => {
    const next = shipment.status === "MEMUAT" ? "MENGIRIM" : "TIBA_DI_TUJUAN";
    setUpdatingId(shipment.id);
    setActionError(null);
    try {
      const updated = await deliveryApiClient.updateStatus(shipment.id, next);
      setItems((prev) =>
        prev
          .map((s) => (s.id === updated.id ? updated : s))
          .filter((s) => s.status === "MEMUAT" || s.status === "MENGIRIM")
      );
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const colStyle = (w?: number): React.CSSProperties => ({
    padding: "14px 20px",
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    color: "#52443D",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    textAlign: "left",
    width: w,
  });

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
          Assigned Shipments
        </h1>
        <p
          style={{
            marginTop: 12,
            fontFamily: "'Lato', sans-serif",
            fontSize: 16,
            color: "#52443D",
          }}
        >
          Your active pickup and delivery tasks
        </p>
      </header>

      {/* Errors */}
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

      {/* Info card */}
      <div
        style={{
          background: "rgba(187,115,84,0.08)",
          border: "1px solid rgba(187,115,84,0.2)",
          borderRadius: 12,
          padding: "14px 20px",
          fontFamily: "'Lato', sans-serif",
          fontSize: 14,
          color: "#854E31",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 700 }}>Status flow:</span>
        <span>Memuat → Mengirim → Tiba di Tujuan</span>
      </div>

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
              <th style={colStyle()}>Date</th>
              <th style={colStyle()}>Plantation</th>
              <th style={colStyle(120)}>Weight (kg)</th>
              <th style={colStyle()}>Harvests</th>
              <th style={colStyle()}>Status</th>
              <th style={colStyle()}>Action</th>
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
                  No active shipments assigned to you
                </td>
              </tr>
            ) : (
              items.map((s) => {
                const canAdvance = s.status === "MEMUAT" || s.status === "MENGIRIM";
                const nextLabel = s.status === "MEMUAT" ? "Start Delivery" : "Mark Arrived";
                return (
                  <tr key={s.id}>
                    <td style={cellStyle}>{formatDate(s.createdAt)}</td>
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
                      {canAdvance && (
                        <button
                          type="button"
                          disabled={updatingId === s.id}
                          onClick={() => void advanceStatus(s)}
                          style={{
                            background: "#BB7354",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 9999,
                            padding: "7px 18px",
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: updatingId === s.id ? "not-allowed" : "pointer",
                            opacity: updatingId === s.id ? 0.5 : 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {updatingId === s.id ? "Updating..." : nextLabel}
                        </button>
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
          {loading ? "Loading..." : `${items.length} active shipment${items.length === 1 ? "" : "s"}`}
        </div>
      </section>

      {/* Legend */}
      <section
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
        }}
      >
        <p style={{ ...labelStyle, marginBottom: 12 }}>Status Guide</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {(["MEMUAT", "MENGIRIM"] as const).map((st) => (
            <div key={st} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShipmentStatusBadge status={st} />
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#52443D" }}>
                {st === "MEMUAT" ? "— waiting for you to start" : "— en route to destination"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
