'use client';

import React, { useState } from "react";
import { approvePayroll, rejectPayroll } from "../api";
import RejectModal from "./RejectModal";
import { Payroll } from "../types";

export default function PayrollTable({ data, onRefresh }: { data?: Payroll[]; onRefresh?: () => void }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const payrolls = data || [];
    const handleRefresh = onRefresh || (() => {});

    const handleApprove = async (id: string) => {
        try {
            await approvePayroll(id);
            handleRefresh();
        } catch (err) {
            console.error(err);
            alert("Gagal melakukan approval");
        }
    };

    const handleConfirmReject = async (reason: string) => {
        if (selectedId) {
            try {
                await rejectPayroll(selectedId, reason);
                setIsModalOpen(false);
                setSelectedId(null);
                handleRefresh();
            } catch (err) {
                console.error(err);
                alert("Gagal melakukan penolakan");
            }
        }
    };

    return (
        <div className="overflow-x-auto border border-[#DBC1B9] rounded-xl bg-white">
            <table className="min-w-full divide-y divide-[#DBC1B9]/40 font-['Lato']">
                {/* Header Sesuai Warna Khusus Figma */}
                <thead className="bg-[#F1E3DD]/40">
                <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#52443D]">Worker ID</th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#52443D]">Amount</th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#52443D]">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#52443D]">Reason</th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#52443D]">Action</th>
                </tr>
                </thead>
                {/* Isi Body Terang & Serasi */}
                <tbody className="divide-y divide-[#DBC1B9]/30 bg-white">
                {payrolls.length > 0 ? (
                    payrolls.map((item: Payroll) => (
                        <tr key={item.id} className="hover:bg-[#F1E3DD]/10 transition-all">
                            <td className="px-8 py-5 whitespace-nowrap text-lg font-semibold text-[#5B2012]">{item.workerId}</td>
                            <td className="px-8 py-5 whitespace-nowrap text-lg text-[#52443D] font-mono">
                                Rp {item.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                {/* Badge Status Earthy (Hijau Daun, Cokelat Judul, Merah Batang Sawit) */}
                                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm border ${
                                    item.status === 'SUCCESS'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : item.status === 'PENDING'
                                            ? 'bg-amber-50 text-[#8A4B2F] border-amber-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                        {item.status}
                                    </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-sm text-[#52443D]/80">
                                {item.rejectionReason || "-"}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                {item.status === 'PENDING' && (
                                    <div className="flex gap-3">
                                        {/* Approve: Hijau Kebun */}
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="px-3 py-1 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none transition-colors shadow-sm"
                                        >
                                            Approve
                                        </button>
                                        {/* Reject: Cokelat Kemerahan Logout Figma */}
                                        <button
                                            onClick={() => {
                                                setSelectedId(item.id);
                                                setIsModalOpen(true);
                                            }}
                                            className="px-3 py-1 text-sm font-medium text-white bg-[#6D2615] rounded-md hover:bg-[#6D2615]/90 focus:outline-none transition-colors shadow-sm"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-[#52443D]/50 text-lg italic">
                            No payroll data found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <RejectModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedId(null);
                }}
                onConfirm={handleConfirmReject}
            />
        </div>
    );
}