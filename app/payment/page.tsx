'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PayrollTable from "@/features/payment/components/PayrollTable";
import { getPayrolls } from "@/features/payment/api";
import { Payroll } from "@/features/payment/types";

const STATUS_OPTIONS = ["", "PENDING", "ACCEPTED", "REJECTED"];

export default function PaymentPage() {
    const router = useRouter();
    const [payrolls, setPayrolls]     = useState<Payroll[]>([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);

    const [tanggal, setTanggal]       = useState("");
    const [status, setStatus]         = useState("");
    const [workerId, setWorkerId]     = useState("");
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPayrolls = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getPayrolls({
                tanggal: tanggal || undefined,
                status: status || undefined,
                workerId: workerId || undefined,
                page,
                size: 20,
            });
            if (result && "content" in result) {
                setPayrolls((result as any).content);
                setTotalPages((result as any).totalPages ?? 1);
            } else {
                setPayrolls(result as Payroll[]);
            }
        } catch {
            setError("Gagal memuat data payroll.");
        } finally {
            setLoading(false);
        }
    }, [tanggal, status, workerId, page]);

    useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#F1E3DD]/30 border-r border-[#EDEDF8] p-6 flex flex-col justify-between min-h-screen shadow-sm">
                <div className="w-full flex flex-col">
                    <div className="flex items-center gap-3 pb-8">
                        <div className="w-10 h-11 bg-[#5B2012]/10 rounded flex items-center justify-center font-bold text-[#5B2012]">
                            🌴
                        </div>
                        <span className="text-[31.24px] font-bold font-['Lato'] text-[#5B2012] leading-[44.63px]">
                            nyawitt
                        </span>
                    </div>

                    <nav className="flex flex-col gap-2 font-['Outfit'] text-xs font-bold">
                        {[
                            { label: "Users", href: "/admin/dashboard" },
                            { label: "Plantation", href: "/plantation" },
                            { label: "Shipments", href: "/delivery" },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className="w-full py-3 px-[18px] text-left text-[#5B2012] cursor-pointer hover:bg-[#5B2012]/5 rounded-full transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}

                        <div className="w-full py-3 px-[18px] bg-[#BB7354] text-white rounded-full shadow-sm">
                            Payroll
                        </div>

                        <button
                            onClick={() => router.push("/payment/wallet")}
                            className="w-full py-3 px-[18px] text-left text-[#5B2012] cursor-pointer hover:bg-[#5B2012]/5 rounded-full transition-colors"
                        >
                            Wallet
                        </button>
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-[#6D2615] hover:bg-[#6D2615]/90 text-white text-xs font-bold font-['Outfit'] rounded-full shadow-sm text-center transition-colors"
                >
                    Logout
                </button>
            </aside>

            {/* MAIN */}
            <main className="flex-1 p-12">
                <header className="mb-8 flex flex-col gap-2">
                    <h1 className="text-[50px] font-bold font-['Lato'] text-[#8A4B2F] leading-[62.50px]">
                        Payroll Management
                    </h1>
                    <p className="text-base font-['Lato'] text-[#52443D] leading-6">
                        Monitor distributed plantation payroll and view recent transaction ledgers.
                    </p>
                </header>

                {/* Filter Bar */}
                <div className="mb-6 bg-white border border-[#DBC1B9] rounded-xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold font-['Lato'] text-[#52443D]">Tanggal</label>
                        <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => { setTanggal(e.target.value); setPage(0); }}
                            className="border border-[#DBC1B9] rounded-lg px-3 py-2 text-sm text-[#52443D] bg-[#F1E3DD]/20 focus:outline-none focus:ring-2 focus:ring-[#BB7354]"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold font-['Lato'] text-[#52443D]">Status</label>
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                            className="border border-[#DBC1B9] rounded-lg px-3 py-2 text-sm text-[#52443D] bg-white focus:outline-none focus:ring-2 focus:ring-[#BB7354]"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s || "Semua Status"}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold font-['Lato'] text-[#52443D]">Worker ID</label>
                        <input
                            type="text"
                            placeholder="Cari worker ID..."
                            value={workerId}
                            onChange={(e) => { setWorkerId(e.target.value); setPage(0); }}
                            className="border border-[#DBC1B9] rounded-lg px-3 py-2 text-sm text-[#52443D] bg-[#F1E3DD]/20 w-44 focus:outline-none focus:ring-2 focus:ring-[#BB7354] placeholder:text-[#52443D]/40"
                        />
                    </div>
                    {(tanggal || status || workerId) && (
                        <button
                            onClick={() => { setTanggal(""); setStatus(""); setWorkerId(""); setPage(0); }}
                            className="px-4 py-2 text-sm font-semibold font-['Lato'] text-[#52443D] bg-[#F1E3DD]/60 rounded-lg hover:bg-[#F1E3DD] transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Card */}
                <div className="w-full py-8 px-8 bg-white shadow-[0_4px_20px_rgba(91,32,18,0.06)] rounded-xl border border-[#DBC1B9]">
                    <div className="pb-2 mb-6 border-b border-[#D8C2BA]/30">
                        <h2 className="text-xs font-bold font-['Lato'] text-[#52443D] tracking-[0.60px] uppercase">
                            Payroll Transaction Info
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-[#BB7354] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-8 text-center text-red-700 font-semibold font-['Lato']">
                            {error}
                            <button onClick={fetchPayrolls} className="ml-3 underline text-sm font-normal">
                                Coba lagi
                            </button>
                        </div>
                    ) : (
                        <>
                            <PayrollTable data={payrolls} onRefresh={fetchPayrolls} />
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-6">
                                    <button
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="px-4 py-2 text-sm font-semibold font-['Lato'] text-[#52443D] bg-white border border-[#DBC1B9] rounded-lg hover:bg-[#F1E3DD]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← Sebelumnya
                                    </button>
                                    <span className="text-sm text-[#52443D] font-semibold font-['Lato']">
                                        Halaman {page + 1} dari {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="px-4 py-2 text-sm font-semibold font-['Lato'] text-[#52443D] bg-white border border-[#DBC1B9] rounded-lg hover:bg-[#F1E3DD]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Selanjutnya →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}