"use client";

import {useState, useCallback, useEffect} from "react";
import { deliveryApi } from "@/features/delivery/api";
import type { Shipment, Driver } from "@/features/delivery/types";
import MandorLayout from "@/components/layout/MandorLayout";
import {useRoleDashboard} from "@/features/admin/useRoleDashboard";

// ===== TYPES =====
type Feedback = { type: "success" | "error"; message: string };
type CreateFormState = {
    driverId: string;
    driverName: string;
    totalWeightKg: string;
};

const initialForm: CreateFormState = { driverId: "", driverName: "", totalWeightKg: "" };

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
    const { user, loading } = useRoleDashboard("MANDOR");
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

    const [driverSearch, setDriverSearch] = useState("");
    const [showDriverDropdown, setShowDriverDropdown] = useState(false);

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(driverSearch.toLowerCase())
    );

    const loadDrivers = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const authHeader = `Bearer ${token}`;

        setDriversLoading(true);
        try {
            const plantationData = await deliveryApi.getMyPlantation(authHeader);
            const plantationId = plantationData?.plantationId;
            if (!plantationId) {
                console.warn("Mandor ini tidak terikat dengan kebun manapun.");
                return;
            }
            const data = await deliveryApi.getAvailableDrivers(plantationId, authHeader);
            setDrivers(data);
        } catch (error) {
            console.error("Gagal memuat supir:", error);
        } finally {
            setDriversLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("#driver-dropdown-container")) {
                setShowDriverDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadApprovedKg = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const authHeader = `Bearer ${token}`; // 👈 sama
        try {
            const kg = await deliveryApi.getTotalApprovedHarvestKg(authHeader);
            setTotalApprovedKg(kg);
        } catch {
            setTotalApprovedKg(null);
        }
    }, []);

    // ===== FETCH ONGOING SHIPMENTS =====
    const loadOngoing = useCallback(async () => {
        if (!user?.id || loading) return;

        const token = localStorage.getItem("token");
        const authHeader = token ? `Bearer ${token}` : "";

        setListLoading(true);
        setListFeedback(null);
        try {
            // 👇 3. Selipkan authHeader di sini!
            const data = await deliveryApi.getOngoingByMandor(user.id, authHeader);
            setOngoingShipments(data);
        } catch {
            setListFeedback({ type: "error", message: "Gagal memuat data pengiriman." });
        } finally {
            setListLoading(false);
        }
    }, [user, loading]);

    useEffect(() => {
        loadOngoing();
        loadDrivers();
        if (loadApprovedKg) loadApprovedKg();
    }, [loadOngoing, loadDrivers, loadApprovedKg]);

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
        const token = localStorage.getItem("token");
        const authHeader = token ? `Bearer ${token}` : "";

        setActionLoading(true);
        try {
            // 👇 3. Selipkan authHeader di sini!
            await deliveryApi.approveByMandor(id, authHeader);
            void loadOngoing();
        } catch {
            setListFeedback({ type: "error", message: "Gagal menyetujui pengiriman." });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectId || !rejectReason.trim()) return;

        const token = localStorage.getItem("token");
        const authHeader = token ? `Bearer ${token}` : "";

        setActionLoading(true);
        try {
            await deliveryApi.rejectByMandor(rejectId, rejectReason, authHeader);
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
        <MandorLayout activePage="Shipments" currentUser={user}>  {/* 👈 fix di sini */}
            <main style={{
                paddingLeft: "0px",
                marginLeft: "-270px"
            }}>
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
                        <div id="driver-dropdown-container" style={{ position: "relative" }}>
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

                            {/* Input search */}
                            <div style={{
                                width: "100%",
                                background: "#FFFFFF",
                                border: "1px solid #DBC1B9",
                                borderRadius: "12px",
                                height: "50px",
                                padding: "0 16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                boxSizing: "border-box",
                            }}
                                 onClick={() => setShowDriverDropdown(prev => !prev)}
                            >
                                <input
                                    value={driverSearch}
                                    onChange={e => {
                                        setDriverSearch(e.target.value);
                                        setShowDriverDropdown(true);
                                        // Reset driverId kalau user ketik ulang
                                        setForm(p => ({ ...p, driverId: "" }));
                                    }}
                                    placeholder={driversLoading ? "Memuat supir..." : "Ketik atau pilih supir..."}
                                    disabled={driversLoading}
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        fontFamily: "Lato, sans-serif",
                                        fontSize: "16px",
                                        color: "#1B1C1B",
                                        background: "transparent",
                                        width: "100%",
                                        cursor: "text",
                                    }}
                                />
                                <span style={{ color: "#52443D", fontSize: "12px" }}>▼</span>
                            </div>

                            {/* Dropdown list */}
                            {showDriverDropdown && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 4px)",
                                    left: 0,
                                    right: 0,
                                    background: "#FFFFFF",
                                    border: "1px solid #DBC1B9",
                                    borderRadius: "12px",
                                    boxShadow: "0px 4px 20px rgba(91,32,18,0.1)",
                                    zIndex: 100,
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                }}>
                                    {filteredDrivers.length === 0 ? (
                                        <div style={{
                                            padding: "12px 16px",
                                            fontFamily: "Lato, sans-serif",
                                            fontSize: "14px",
                                            color: "#86736C",
                                        }}>
                                            Tidak ada supir ditemukan
                                        </div>
                                    ) : (
                                        filteredDrivers.map(d => (
                                            <div
                                                key={d.id}
                                                onClick={() => {
                                                    setForm(p => ({ ...p, driverId: d.id, driverName: d.name }));
                                                    setDriverSearch(d.name);
                                                    setShowDriverDropdown(false);
                                                }}
                                                style={{
                                                    padding: "12px 16px",
                                                    fontFamily: "Lato, sans-serif",
                                                    fontSize: "14px",
                                                    color: form.driverId === d.id ? "#5B2012" : "#1B1C1B",
                                                    background: form.driverId === d.id ? "rgba(91,32,18,0.06)" : "transparent",
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid rgba(219,193,185,0.4)",
                                                }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLDivElement).style.background = "rgba(91,32,18,0.04)";
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLDivElement).style.background =
                                                        form.driverId === d.id ? "rgba(91,32,18,0.06)" : "transparent";
                                                }}
                                            >
                                                {d.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Hidden input untuk validasi required */}
                            <input
                                type="text"
                                required
                                value={form.driverId}
                                onChange={() => {}}
                                style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
                                tabIndex={-1}
                            />
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
            </main>
        </MandorLayout>
    );
}