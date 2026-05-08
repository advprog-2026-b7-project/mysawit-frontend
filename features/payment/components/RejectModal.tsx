import React, { useState } from "react";

export default function RejectModal({ isOpen, onClose, onConfirm }: any) {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Tolak Payroll
                    </h2>
                </div>
                <div className="p-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alasan Penolakan
                    </label>
                    <textarea
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        rows={4}
                        placeholder="Masukkan alasan penolakan..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(reason);
                            setReason("");
                        }}
                        disabled={!reason.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Konfirmasi
                    </button>
                </div>
            </div>
        </div>
    );
}