"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { plantationClient } from "@/features/plantation/api";
import type { PlantationDetailResponse } from "@/features/plantation/types";
import PlantationCodeBadge from "./PlantationCodeBadge";
import CoordinateDisplay from "./CoordinateDisplay";

interface PlantationDetailViewProps {
  id: string;
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  color: "#53433D",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  display: "block",
  marginBottom: 4,
};

const sectionValueStyle: React.CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 400,
  fontSize: 16,
  color: "#1B1C1B",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function PlantationDetailView({ id }: PlantationDetailViewProps) {
  const [detail, setDetail] = useState<PlantationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mandorInput, setMandorInput] = useState("");
  const [driverInput, setDriverInput] = useState("");
  const [mandorReassignTarget, setMandorReassignTarget] = useState("");
  const [driverReassignTarget, setDriverReassignTarget] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await plantationClient.getById(id);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plantation.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const runAction = async (fn: () => Promise<void>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await fn();
      await loadDetail();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignMandor = () =>
    runAction(async () => {
      if (!mandorInput.trim()) throw new Error("Please enter a Mandor UUID.");
      await plantationClient.assignMandor(id, { mandorId: mandorInput.trim() });
      setMandorInput("");
    });

  const handleUnassignMandor = () => {
    const reassignToPlantationId = mandorReassignTarget.trim();
    if (!reassignToPlantationId) {
      setActionError("Please enter the target plantation UUID for reassignment.");
      return;
    }
    if (!confirm("Are you sure you want to unassign this Mandor?")) return;
    void runAction(async () => {
      await plantationClient.unassignMandor(id, { reassignToPlantationId });
      setMandorReassignTarget("");
    });
  };

  const handleAssignDriver = () =>
    runAction(async () => {
      if (!driverInput.trim()) throw new Error("Please enter a Driver UUID.");
      await plantationClient.assignDriver(id, { driverId: driverInput.trim() });
      setDriverInput("");
    });

  const handleUnassignDriver = (driverId: string) => {
    const reassignToPlantationId = driverReassignTarget.trim();
    if (!reassignToPlantationId) {
      setActionError("Please enter the target plantation UUID for reassignment.");
      return;
    }
    if (!confirm("Are you sure you want to remove this driver?")) return;
    void runAction(async () => {
      await plantationClient.unassignDriver(id, driverId, { reassignToPlantationId });
      setDriverReassignTarget("");
    });
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'Lato', sans-serif", color: "#52443D", padding: 40 }}>Loading...</div>
    );
  }

  if (error || !detail) {
    return (
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
        {error ?? "Plantation not found."}
      </div>
    );
  }

  const drivers = detail.drivers?.content ?? [];

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/admin/plantations"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#854E31",
            textDecoration: "none",
          }}
        >
          ← Back to Plantations
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 50,
            color: "#5B2012",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Plantation Detail
        </h1>
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#53433D",
            margin: "8px 0 0",
          }}
        >
          {detail.name}
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
            marginBottom: 16,
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
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#5B2012",
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          Plantation Info
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <span style={sectionLabelStyle}>Name</span>
            <span style={sectionValueStyle}>{detail.name}</span>
          </div>
          <div>
            <span style={sectionLabelStyle}>Code</span>
            <PlantationCodeBadge code={detail.code} />
          </div>
          <div>
            <span style={sectionLabelStyle}>Area</span>
            <span style={sectionValueStyle}>{detail.area} ha</span>
          </div>
          <div>
            <span style={sectionLabelStyle}>Coordinates</span>
            <CoordinateDisplay coordinates={detail.coordinates} />
          </div>
          <div>
            <span style={sectionLabelStyle}>Created At</span>
            <span style={sectionValueStyle}>{formatDate(detail.createdAt)}</span>
          </div>
          <div>
            <span style={sectionLabelStyle}>Last Updated</span>
            <span style={sectionValueStyle}>{formatDate(detail.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Management section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Mandor card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#5B2012",
                margin: 0,
              }}
            >
              Mandor
            </h3>
            {detail.mandor && (
              <span
                style={{
                  background: "rgba(138,75,47,0.1)",
                  borderRadius: 9999,
                  padding: "4px 12px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#8A4B2F",
                }}
              >
                Assigned
              </span>
            )}
          </div>

          {detail.mandor ? (
            <div>
              <div
                style={{
                  background: "#FFF1EC",
                  border: "1px solid rgba(216,194,186,0.3)",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#EDE8E4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#5B2012",
                      flexShrink: 0,
                    }}
                  >
                    {detail.mandor.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#1B1C1B",
                        margin: 0,
                      }}
                    >
                      {detail.mandor.name}
                    </p>
                    {detail.mandor.certificationNumber && (
                      <p
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 400,
                          fontSize: 13,
                          color: "#53433D",
                          margin: "2px 0 0",
                        }}
                      >
                        Cert: {detail.mandor.certificationNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ display: "flex", width: "100%", gap: 8 }}>
                  <input
                    type="text"
                    value={mandorReassignTarget}
                    onChange={(e) => setMandorReassignTarget(e.target.value)}
                    placeholder="Reassign target plantation UUID..."
                    style={{
                      flex: 1,
                      border: "1px solid #DBC1B9",
                      borderRadius: 12,
                      height: 40,
                      padding: "0 12px",
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 13,
                      color: "#1B1C1B",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleUnassignMandor}
                    disabled={actionLoading}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#BA1A1A",
                      cursor: actionLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Unassign
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={mandorInput}
                onChange={(e) => setMandorInput(e.target.value)}
                placeholder="Paste Mandor UUID..."
                style={{
                  width: "100%",
                  border: "1px solid #DBC1B9",
                  borderRadius: 12,
                  height: 48,
                  padding: "0 16px",
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 14,
                  color: "#1B1C1B",
                  outline: "none",
                  marginBottom: 12,
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={handleAssignMandor}
                disabled={actionLoading}
                style={{
                  background: "#BB7354",
                  borderRadius: 9999,
                  padding: "8px 24px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#FFFFFF",
                  border: "none",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                Assign
              </button>
            </div>
          )}
        </div>

        {/* Drivers card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#5B2012",
              marginTop: 0,
              marginBottom: 16,
            }}
          >
            Truck Drivers
          </h3>

          {drivers.length === 0 ? (
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: 14,
                color: "#52443D",
                marginBottom: 16,
              }}
            >
              No truck drivers assigned.
            </p>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(91,32,18,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>👤</span>
                    <span
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 400,
                        fontSize: 16,
                        color: "#1B1C1B",
                      }}
                    >
                      {driver.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnassignDriver(driver.id)}
                    disabled={actionLoading}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#BA1A1A",
                      cursor: actionLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add driver */}
          <div>
            <label
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "#53433D",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "block",
                marginBottom: 8,
              }}
            >
              Reassign Removed Driver To
            </label>
            <input
              type="text"
              value={driverReassignTarget}
              onChange={(e) => setDriverReassignTarget(e.target.value)}
              placeholder="Target plantation UUID..."
              style={{
                width: "100%",
                border: "1px solid #DBC1B9",
                borderRadius: 12,
                height: 42,
                padding: "0 16px",
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                color: "#1B1C1B",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />
            <label
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "#53433D",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "block",
                marginBottom: 8,
              }}
            >
              Add Driver
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={driverInput}
                onChange={(e) => setDriverInput(e.target.value)}
                placeholder="Paste Driver UUID..."
                style={{
                  flex: 1,
                  border: "1px solid #DBC1B9",
                  borderRadius: 12,
                  height: 48,
                  padding: "0 16px",
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 14,
                  color: "#1B1C1B",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={handleAssignDriver}
                disabled={actionLoading}
                style={{
                  background: "#BB7354",
                  borderRadius: 9999,
                  padding: "8px 20px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#FFFFFF",
                  border: "none",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  flexShrink: 0,
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
