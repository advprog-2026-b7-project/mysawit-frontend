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
            console.error("Error approving payroll:", err);
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
                console.error("Error rejecting payroll:", err);
                alert("Gagal melakukan penolakan");
            }
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Worker ID</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Amount</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Reason</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {payrolls.length > 0 ? (
                    payrolls.map((item: Payroll) => (
                        <tr key={item.id} className="hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-all">
                            <td className="px-8 py-5 whitespace-nowrap text-lg font-semibold text-gray-900 dark:text-gray-100">{item.workerId}</td>
                            <td className="px-8 py-5 whitespace-nowrap text-lg text-gray-700 dark:text-gray-300 font-mono">
                                Rp {item.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                    <span className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm ${
                                        item.status === 'SUCCESS'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                                            : item.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30'
                                                : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                                    }`}>
                                        {item.status}
                                    </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.rejectionReason || "-"}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                {item.status === 'PENDING' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedId(item.id);
                                                setIsModalOpen(true);
                                            }}
                                            className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
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
                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 dark:text-gray-500 text-lg italic">
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