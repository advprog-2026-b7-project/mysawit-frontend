'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWalletBalance, topUpWallet } from "@/features/payment/api";
import { Wallet } from "@/features/payment/types";

export default function Page() {
    const router = useRouter();
    const [wallet, setWallet]           = useState<Wallet | null>(null);
    const [loading, setLoading]         = useState(true);
    const [topUpAmount, setTopUpAmount] = useState("");
    const [topUpLoading, setTopUpLoading] = useState(false);
    const [paymentUrl, setPaymentUrl]   = useState<string | null>(null);
    const [error, setError]             = useState<string | null>(null);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        setLoading(true);
        try {
            const data = await getWalletBalance();
            setWallet(data);
        } catch {
            setError("Gagal memuat saldo wallet.");
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async () => {
        const amount = parseFloat(topUpAmount);
        if (!amount || amount < 1) {
            setError("Minimal top-up adalah 1 SawitDollar.");
            return;
        }
        setTopUpLoading(true);
        setError(null);
        setPaymentUrl(null);
        try {
            const url = await topUpWallet(amount);
            if (url) {
                setPaymentUrl(url);
            } else {
                setError("Gagal membuat payment link.");
            }
        } catch {
            setError("Gagal melakukan top-up.");
        } finally {
            setTopUpLoading(false);
        }
    };

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

                        <button
                            onClick={() => router.push("/payment")}
                            className="w-full py-3 px-[18px] text-left text-[#5B2012] cursor-pointer hover:bg-[#5B2012]/5 rounded-full transition-colors"
                        >
                            Payroll
                        </button>

                        {/* Active */}
                        <div className="w-full py-3 px-[18px] bg-[#BB7354] text-white rounded-full shadow-sm">
                            Wallet
                        </div>
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
                        Wallet
                    </h1>
                    <p className="text-base font-['Lato'] text-[#52443D] leading-6">
                        Kelola saldo SawitDollar untuk pembayaran payroll.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Saldo Card */}
                    <div className="bg-white border border-[#DBC1B9] rounded-xl p-8 shadow-[0_4px_20px_rgba(91,32,18,0.06)]">
                        <h2 className="text-xs font-bold font-['Lato'] text-[#52443D] tracking-[0.60px] uppercase mb-6 pb-2 border-b border-[#D8C2BA]/30">
                            Saldo Wallet
                        </h2>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-[#BB7354] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-['Lato'] text-[#52443D]/70">Saldo saat ini</p>
                                <p className="text-4xl font-bold font-['Lato'] text-[#5B2012]">
                                    {wallet?.balance?.toLocaleString('id-ID') ?? 0}
                                    <span className="text-lg font-normal text-[#52443D]/60 ml-2">SD</span>
                                </p>
                                <p className="text-sm font-['Lato'] text-[#52443D]/50">
                                    ≈ Rp {((wallet?.balance ?? 0) * 10000).toLocaleString('id-ID')}
                                </p>
                                <button
                                    onClick={fetchBalance}
                                    className="mt-4 w-fit text-xs font-semibold font-['Lato'] text-[#BB7354] hover:underline"
                                >
                                    Refresh ↻
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Top Up Card */}
                    <div className="bg-white border border-[#DBC1B9] rounded-xl p-8 shadow-[0_4px_20px_rgba(91,32,18,0.06)]">
                        <h2 className="text-xs font-bold font-['Lato'] text-[#52443D] tracking-[0.60px] uppercase mb-6 pb-2 border-b border-[#D8C2BA]/30">
                            Top Up SawitDollar
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-semibold font-['Lato'] text-[#52443D] mb-1 block">
                                    Jumlah SawitDollar
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="Contoh: 100"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    className="w-full border border-[#DBC1B9] rounded-lg px-4 py-3 text-[#52443D] bg-[#F1E3DD]/20 focus:outline-none focus:ring-2 focus:ring-[#BB7354] font-['Lato']"
                                />
                                {topUpAmount && (
                                    <p className="text-xs text-[#52443D]/60 mt-1 font-['Lato']">
                                        = Rp {(parseFloat(topUpAmount) * 10000).toLocaleString('id-ID')}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 font-['Lato']">{error}</p>
                            )}

                            <button
                                onClick={handleTopUp}
                                disabled={topUpLoading || !topUpAmount}
                                className="w-full py-3 bg-[#BB7354] hover:bg-[#BB7354]/90 text-white text-sm font-bold font-['Outfit'] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {topUpLoading ? "Memproses..." : "Buat Payment Link"}
                            </button>

                            {/* Payment URL result */}
                            {paymentUrl && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-green-800 font-['Lato'] mb-2">
                                        ✅ Payment link berhasil dibuat!
                                    </p>
                                    <a
                                        href={paymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full block text-center py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold font-['Outfit'] rounded-lg transition-colors"
                                    >
                                        Bayar Sekarang →
                                    </a>
                                    <p className="text-xs text-green-700/70 mt-2 font-['Lato'] text-center">
                                        Link berlaku 24 jam
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-[#F1E3DD]/40 border border-[#DBC1B9] rounded-xl p-6">
                    <p className="text-sm font-['Lato'] text-[#52443D]">
                        <span className="font-bold">ℹ️ Info:</span> 1 SawitDollar (SD) = Rp 10.000.
                        Saldo wallet digunakan untuk pembayaran payroll buruh, supir, dan mandor
                        setelah disetujui Admin.
                    </p>
                </div>
            </main>
        </div>
    );
}