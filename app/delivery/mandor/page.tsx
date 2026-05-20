"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/features/auth/useAuth";
import { deliveryApi } from "@/features/delivery/api";
import type { Shipment } from "@/features/delivery/types";

// ===== TYPES =====
type Feedback = { type: "success" | "error"; message: string };
type Driver = { id: string; driverName: string };
type CreateFormState = {
    driverId: string;
    totalWeightKg: string;
};

const initialForm: CreateFormState = { driverId: "", totalWeightKg: "" };

// ===== STATUS BADGE =====
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        MEMUAT:           { bg: "rgba(237,232,228,0.5)",    color: "#52443D" },
        MENGIRIM:         { bg: "rgba(138,75,47,0.1)",      color: "#8A4B2F" },
        TIBA_DI_TUJUAN:   { bg: "rgba(138,75,47,0.15)",     color: "#5B2012" },
        DISETUJUI_MANDOR: { bg: "rgba(91,32,18,0.08)",      color: "#5B2012" },
        DITOLAK_MANDOR:   { bg: "rgba(186,26,26,0.08)",     color: "#BA1A1A" },
        DISETUJUI_ADMIN:  { bg: "rgba(91,32,18,0.08)",      color: "#5B2012" },
        DITOLAK_ADMIN:    { bg: "rgba(186,26,26,0.08)",     color: "#BA1A1A" },
        DISETUJUI_PARSIAL:{ bg: "rgba(138,75,47,0.1)",      color: "#8A4B2F" },
    };
    const style = map[status] ?? { bg: "rgba(237,232,228,0.5)", color: "#52443D" };
    return (
        <span style={{
            background: style.bg,
            color: style.color,
            borderRadius: "9999px",
            padding: "4px 12px",
            fontFamily: "Lato, sans-serif",
            fontWeight: 700,
            fontSize: "12px",
            whiteSpace: "nowrap",
        }}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

// ===== MAIN PAGE =====
export default function MandorDeliveryPage() {
    const { user } = useAuth();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const authHeader = token ? `Bearer ${token}` : "";

    const [form, setForm] = useState<CreateFormState>(initialForm);
    const [createLoading, setCreateLoading] = useState(false);
    const [createFeedback, setCreateFeedback] = useState<Feedback | null>(null);

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [driversLoading, setDriversLoading] = useState(false);

    const [totalApprovedKg, setTotalApprovedKg] = useState<number | null>(null);

    const [ongoingShipments, setOngoingShipments] = useState<Shipment[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listFeedback, setListFeedback] = useState<Feedback | null>(null);

    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // ===== FETCH DRIVERS =====
    const loadDrivers = useCallback(async () => {
        if (!authHeader) return;
        setDriversLoading(true);
        try {
            const data = await deliveryApi.getAvailableDrivers(authHeader);
            setDrivers(data);
        } catch {
            // silent fail, form tetap bisa dipakai manual
        } finally {
            setDriversLoading(false);
        }
    }, [authHeader]);

    // ===== FETCH TOTAL APPROVED KG =====
    const loadApprovedKg = useCallback(async () => {
        if (!authHeader) return;
        try {
            const kg = await deliveryApi.getTotalApprovedHarvestKg(authHeader);
            setTotalApprovedKg(kg);
        } catch {
            setTotalApprovedKg(null);
        }
    }, [authHeader]);

    // ===== FETCH ONGOING SHIPMENTS =====
    const loadOngoing = useCallback(async () => {
        if (!user?.sub) return;
        setListLoading(true);
        setListFeedback(null);
        try {
            const data = await deliveryApi.getOngoingByMandor(user.sub);
            setOngoingShipments(data);
        } catch {
            setListFeedback({ type: "error", message: "Gagal memuat data pengiriman." });
        } finally {
            setListLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void loadDrivers();
        void loadApprovedKg();
        void loadOngoing();
    }, [loadDrivers, loadApprovedKg, loadOngoing]);

    // ===== HANDLERS =====
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateFeedback(null);
        try {
            const response = await deliveryApi.createShipmentWithDriver({
                driverId: form.driverId,
                totalWeightKg: Number(form.totalWeightKg),
            }, authHeader);
            setCreateFeedback({
                type: "success",
                message: `Pengiriman berhasil dibuat! ID: ${response.id}`,
            });
            setForm(initialForm);
            void loadOngoing();
            void loadApprovedKg();
        } catch (err) {
            setCreateFeedback({
                type: "error",
                message: err instanceof Error ? err.message : "Gagal membuat pengiriman.",
            });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(true);
        try {
            await deliveryApi.approveByMandor(id);
            void loadOngoing();
        } catch {
            setListFeedback({ type: "error", message: "Gagal menyetujui pengiriman." });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectId || !rejectReason.trim()) return;
        setActionLoading(true);
        try {
            await deliveryApi.rejectByMandor(rejectId, rejectReason);
            setRejectId(null);
            setRejectReason("");
            void loadOngoing();
        } catch {
            setListFeedback({ type: "error", message: "Gagal menolak pengiriman." });
        } finally {
            setActionLoading(false);
        }
    };

    if (!user) return null;

    return (
        <AdminLayout activePage="Shipments">
            <div style={{
                minHeight: "100vh",
                background: "#FAF6F3",
                padding: "40px 32px",
                fontFamily: "Lato, sans-serif",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                    {/* ===== HEADER ===== */}
                    <div style={{ marginBottom: "32px" }}>
                        <h1 style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 700,
                            fontSize: "50px",
                            color: "#5B2012",
                            margin: 0,
                            lineHeight: 1.1,
                        }}>
                            Manajemen Pengiriman
                        </h1>
                        <p style={{
                            fontFamily: "Lato, sans-serif",
                            fontWeight: 400,
                            fontSize: "16px",
                            color: "#52443D",
                            margin: "8px 0 0",
                        }}>
                            Tugaskan supir dan kirim hasil panen sawit ke pabrik.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(340px, 0.9fr) minmax(0, 1.35fr)",
                        gap: "24px",
                        alignItems: "start",
                    }}>

                        {/* ===== KOLOM KIRI: FORM ===== */}
                        <section style={{
                            background: "#FFFFFF",
                            border: "1px solid #DBC1B9",
                            borderRadius: "12px",
                            boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
                            padding: "28px",
                        }}>
                            <h2 style={{
                                fontFamily: "Lato, sans-serif",
                                fontWeight: 700,
                                fontSize: "16px",
                                color: "#5B2012",
                                margin: "0 0 4px",
                            }}>
                                Buat Pengiriman Baru
                            </h2>
                            <p style={{
                                fontFamily: "Lato, sans-serif",
                                fontSize: "13px",
                                color: "#52443D",
                                margin: "0 0 20px",
                            }}>
                                Maksimal berat muatan 400 kg.
                            </p>

                            {/* Info total approved kg */}
                            {totalApprovedKg !== null && (
                                <div style={{
                                    background: "rgba(91,32,18,0.06)",
                                    border: "1px solid rgba(91,32,18,0.15)",
                                    borderRadius: "8px",
                                    padding: "12px 16px",
                                    marginBottom: "20px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                    <span style={{
                                        fontFamily: "Lato, sans-serif",
                                        fontSize: "13px",
                                        color: "#52443D",
                                    }}>
                                        Total Panen Siap Kirim
                                    </span>
                                    <span style={{
                                        fontFamily: "Lato, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "16px",
                                        color: "#5B2012",
                                    }}>
                                        {totalApprovedKg} kg
                                    </span>
                                </div>
                            )}

                            {/* Feedback */}
                            {createFeedback && (
                                <div style={{
                                    background: createFeedback.type === "success"
                                        ? "rgba(91,32,18,0.06)"
                                        : "rgba(186,26,26,0.08)",
                                    border: `1px solid ${createFeedback.type === "success"
                                        ? "rgba(91,32,18,0.15)"
                                        : "rgba(186,26,26,0.2)"}`,
                                    borderRadius: "8px",
                                    padding: "12px 16px",
                                    marginBottom: "20px",
                                    fontFamily: "Lato, sans-serif",
                                    fontSize: "14px",
                                    color: createFeedback.type === "success" ? "#5B2012" : "#BA1A1A",
                                }}>
                                    {createFeedback.message}
                                </div>
                            )}

                            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                                {/* Driver Dropdown */}
                                <div>
                                    <label style={{
                                        display: "block",
                                        fontFamily: "Lato, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "12px",
                                        color: "#52443D",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.6px",
                                        marginBottom: "8px",
                                    }}>
                                        Supir Truk
                                    </label>
                                    <select
                                        value={form.driverId}
                                        onChange={e => setForm(p => ({ ...p, driverId: e.target.value }))}
                                        required
                                        disabled={driversLoading}
                                        style={{
                                            width: "100%",
                                            background: "#FFFFFF",
                                            border: "1px solid #DBC1B9",
                                            borderRadius: "12px",
                                            height: "50px",
                                            padding: "0 16px",
                                            fontFamily: "Lato, sans-serif",
                                            fontSize: "16px",
                                            color: form.driverId ? "#1B1C1B" : "rgba(91,32,18,0.3)",
                                            outline: "none",
                                            cursor: driversLoading ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        <option value="">
                                            {driversLoading ? "Memuat supir..." : "Pilih supir truk..."}
                                        </option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.driverName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Total Weight */}
                                <div>
                                    <label style={{
                                        display: "block",
                                        fontFamily: "Lato, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "12px",
                                        color: "#52443D",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.6px",
                                        marginBottom: "8px",
                                    }}>
                                        Total Berat (kg)
                                    </label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max={Math.min(400, totalApprovedKg ?? 400)}
                                        step="0.01"
                                        value={form.totalWeightKg}
                                        onChange={e => setForm(p => ({ ...p, totalWeightKg: e.target.value }))}
                                        placeholder="Contoh: 350"
                                        required
                                        style={{
                                            width: "100%",
                                            background: "#FFFFFF",
                                            border: "1px solid #DBC1B9",
                                            borderRadius: "12px",
                                            height: "50px",
                                            padding: "0 16px",
                                            fontFamily: "Lato, sans-serif",
                                            fontSize: "16px",
                                            color: "#1B1C1B",
                                            outline: "none",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                    <p style={{
                                        fontFamily: "Lato, sans-serif",
                                        fontSize: "13px",
                                        color: "#86736C",
                                        margin: "6px 0 0",
                                    }}>
                                        Maks {Math.min(400, totalApprovedKg ?? 400)} kg
                                        {totalApprovedKg !== null && totalApprovedKg < 400
                                            ? " (dibatasi oleh stok panen)"
                                            : " (kapasitas truk)"}
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                    borderTop: "1px solid #DBC1B9",
                                    paddingTop: "20px",
                                    marginTop: "4px",
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setForm(initialForm)}
                                        disabled={createLoading}
                                        style={{
                                            background: "white",
                                            border: "1px solid #DBC1B9",
                                            borderRadius: "9999px",
                                            padding: "12px 32px",
                                            fontFamily: "Lato, sans-serif",
                                            fontWeight: 700,
                                            fontSize: "14px",
                                            color: "#5B2012",
                                            cursor: createLoading ? "not-allowed" : "pointer",
                                            opacity: createLoading ? 0.5 : 1,
                                        }}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        style={{
                                            background: "#BB7354",
                                            border: "none",
                                            borderRadius: "9999px",
                                            padding: "12px 32px",
                                            fontFamily: "Lato, sans-serif",
                                            fontWeight: 700,
                                            fontSize: "14px",
                                            color: "white",
                                            cursor: createLoading ? "not-allowed" : "pointer",
                                            opacity: createLoading ? 0.5 : 1,
                                        }}
                                    >
                                        {createLoading ? "Membuat..." : "Buat Pengiriman"}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* ===== KOLOM KANAN: LIST ===== */}
                        <section style={{
                            background: "#FFFFFF",
                            border: "1px solid #DBC1B9",
                            borderRadius: "12px",
                            boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
                            padding: "28px",
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                borderBottom: "1px solid #DBC1B9",
                                paddingBottom: "20px",
                                marginBottom: "20px",
                            }}>
                                <div>
                                    <h2 style={{
                                        fontFamily: "Lato, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "16px",
                                        color: "#5B2012",
                                        margin: 0,
                                    }}>
                                        Pengiriman Berlangsung
                                    </h2>
                                    <p style={{
                                        fontFamily: "Lato, sans-serif",
                                        fontSize: "13px",
                                        color: "#52443D",
                                        margin: "4px 0 0",
                                    }}>
                                        Status pengiriman aktif di kebun Anda.
                                    </p>
                                </div>
                                <button
                                    onClick={() => void loadOngoing()}
                                    disabled={listLoading}
                                    style={{
                                        background: "white",
                                        border: "1px solid #DBC1B9",
                                        borderRadius: "9999px",
                                        padding: "8px 20px",
                                        fontFamily: "Lato, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        color: "#5B2012",
                                        cursor: listLoading ? "not-allowed" : "pointer",
                                        opacity: listLoading ? 0.5 : 1,
                                    }}
                                >
                                    {listLoading ? "Loading..." : "↻ Refresh"}
                                </button>
                            </div>

                            {listFeedback && (
                                <div style={{
                                    background: "rgba(186,26,26,0.08)",
                                    border: "1px solid rgba(186,26,26,0.2)",
                                    borderRadius: "8px",
                                    padding: "12px 16px",
                                    marginBottom: "16px",
                                    fontFamily: "Lato, sans-serif",
                                    fontSize: "14px",
                                    color: "#BA1A1A",
                                }}>
                                    {listFeedback.message}
                                </div>
                            )}

                            {/* Reject Modal */}
                            {rejectId && (
                                <div style={{
                                    background: "rgba(186,26,26,0.08)",
                                    border: "1px solid rgba(186,26,26,0.2)",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    marginBottom: "16px",
                                }}>
                                    <p style={{
                                        fontFamily: "Lato, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        color: "#BA1A1A",
                                        margin: "0 0 12px",
                                    }}>
                                        Alasan Penolakan
                                    </p>
                                    <textarea
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        placeholder="Masukkan alasan penolakan..."
                                        rows={3}
                                        style={{
                                            width: "100%",
                                            background: "#FFFFFF",
                                            border: "1px solid #BA1A1A",
                                            borderRadius: "12px",
                                            padding: "12px 16px",
                                            fontFamily: "Lato, sans-serif",
                                            fontSize: "14px",
                                            color: "#1B1C1B",
                                            outline: "none",
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                            marginBottom: "12px",
                                        }}
                                    />
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => void handleReject()}
                                            disabled={actionLoading || !rejectReason.trim()}
                                            style={{
                                                background: "#BA1A1A",
                                                border: "none",
                                                borderRadius: "9999px",
                                                padding: "10px 24px",
                                                fontFamily: "Lato, sans-serif",
                                                fontWeight: 700,
                                                fontSize: "14px",
                                                color: "white",
                                                cursor: (actionLoading || !rejectReason.trim())
                                                    ? "not-allowed" : "pointer",
                                                opacity: (actionLoading || !rejectReason.trim())
                                                    ? 0.5 : 1,
                                            }}
                                        >
                                            {actionLoading ? "Memproses..." : "Konfirmasi Tolak"}
                                        </button>
                                        <button
                                            onClick={() => { setRejectId(null); setRejectReason(""); }}
                                            style={{
                                                background: "white",
                                                border: "1px solid #DBC1B9",
                                                borderRadius: "9999px",
                                                padding: "10px 24px",
                                                fontFamily: "Lato, sans-serif",
                                                fontWeight: 700,
                                                fontSize: "14px",
                                                color: "#5B2012",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Table */}
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                    <tr style={{ background: "#F6F3F1", borderBottom: "1px solid #DBC1B9" }}>
                                        {["ID", "Berat", "Status", "Dibuat", "Aksi"].map(h => (
                                            <th key={h} style={{
                                                padding: "16px 24px",
                                                textAlign: "left",
                                                fontFamily: "Lato, sans-serif",
                                                fontWeight: 700,
                                                fontSize: "14px",
                                                color: "#52443D",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.7px",
                                                whiteSpace: "nowrap",
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {listLoading ? (
                                        <tr>
                                            <td colSpan={5} style={{
                                                padding: "48px 24px",
                                                textAlign: "center",
                                                fontFamily: "Lato, sans-serif",
                                                fontSize: "14px",
                                                color: "#52443D",
                                            }}>
                                                Memuat data...
                                            </td>
                                        </tr>
                                    ) : ongoingShipments.length > 0 ? (
                                        ongoingShipments.map((s, i) => (
                                            <tr key={s.id} style={{
                                                borderTop: i === 0 ? "none" : "1px solid #DBC1B9",
                                                cursor: "default",
                                            }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLTableRowElement).style.background = "rgba(91,32,18,0.03)";
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                                                }}
                                            >
                                                <td style={{
                                                    padding: "16px 24px",
                                                    fontFamily: "'Courier New', monospace",
                                                    fontSize: "13px",
                                                    color: "#53433D",
                                                }}>
                                                    {s.id.substring(0, 8)}...
                                                </td>
                                                <td style={{
                                                    padding: "16px 24px",
                                                    fontFamily: "Lato, sans-serif",
                                                    fontWeight: 600,
                                                    fontSize: "14px",
                                                    color: "#1B1C1B",
                                                    whiteSpace: "nowrap",
                                                }}>
                                                    {s.totalWeightKg} kg
                                                </td>
                                                <td style={{ padding: "16px 24px" }}>
                                                    <StatusBadge status={s.status} />
                                                </td>
                                                <td style={{
                                                    padding: "16px 24px",
                                                    fontFamily: "Lato, sans-serif",
                                                    fontSize: "14px",
                                                    color: "#52443D",
                                                    whiteSpace: "nowrap",
                                                }}>
                                                    {formatDateTime(s.createdAt)}
                                                </td>
                                                <td style={{ padding: "16px 24px" }}>
                                                    {s.status === "TIBA_DI_TUJUAN" && (
                                                        <div style={{ display: "flex", gap: "8px" }}>
                                                            <button
                                                                onClick={() => void handleApprove(s.id)}
                                                                disabled={actionLoading}
                                                                style={{
                                                                    background: "#BB7354",
                                                                    border: "none",
                                                                    borderRadius: "9999px",
                                                                    padding: "6px 16px",
                                                                    fontFamily: "Lato, sans-serif",
                                                                    fontWeight: 700,
                                                                    fontSize: "12px",
                                                                    color: "white",
                                                                    cursor: actionLoading ? "not-allowed" : "pointer",
                                                                    opacity: actionLoading ? 0.5 : 1,
                                                                }}
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectId(s.id)}
                                                                disabled={actionLoading}
                                                                style={{
                                                                    background: "transparent",
                                                                    border: "none",
                                                                    fontFamily: "Lato, sans-serif",
                                                                    fontWeight: 700,
                                                                    fontSize: "12px",
                                                                    color: "#BA1A1A",
                                                                    cursor: actionLoading ? "not-allowed" : "pointer",
                                                                    opacity: actionLoading ? 0.5 : 1,
                                                                    padding: "6px 8px",
                                                                }}
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{
                                                padding: "48px 24px",
                                                textAlign: "center",
                                                fontFamily: "Lato, sans-serif",
                                                fontSize: "14px",
                                                color: "#52443D",
                                            }}>
                                                Tidak ada pengiriman berlangsung.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}