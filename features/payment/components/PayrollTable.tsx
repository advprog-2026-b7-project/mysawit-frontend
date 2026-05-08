import React, { useState } from "react";
import { approvePayroll, rejectPayroll } from "../api";
import RejectModal from "./RejectModal";

export default function PayrollTable({ data, onRefresh }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        try {
            await approvePayroll(id);
            onRefresh();
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
                onRefresh();
            } catch (err) {
                console.error("Error rejecting payroll:", err);
                alert("Gagal melakukan penolakan");
            }
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-green-500 rounded-lg shadow-sm">
                <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border-b border-green-500 p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Worker ID
                    </th>
                    <th className="border-b border-green-500 p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Status
                    </th>
                    <th className="border-b border-green-500 p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Reason
                    </th>
                    <th className="border-b border-green-500 p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Action
                    </th>
                </tr>
                </thead>
                <tbody>
                {data && data.map((item: any) => (
                    <tr key={item.id} className="border-b border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                        <td className="p-3 text-sm text-gray-800 dark:text-gray-200">
                            {item.workerId}
                        </td>
                        <td className="p-3">
                                <span className={`
                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                    item.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                                `}>
                                    {item.status}
                                </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
                            {item.rejectionReason || "-"}
                        </td>
                        <td className="p-3">
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
                ))}
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