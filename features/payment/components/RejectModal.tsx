'use client';

import React, { useState } from "react";

export default function RejectModal({
                                        isOpen,
                                        onClose,
                                        onConfirm,
                                    }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}) {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md font-['Lato']">
                {/* Header */}
                <div className="border-b border-[#DBC1B9] px-6 py-4">
                    <h2 className="text-lg font-bold text-[#5B2012]">
                        Tolak Payroll
                    </h2>
                </div>

                {/* Body */}
                <div className="p-6">
                    <label className="block text-sm font-semibold text-[#52443D] mb-2">
                        Alasan Penolakan
                    </label>
                    <textarea
                        className="w-full border border-[#DBC1B9] rounded-lg p-3 text-[#52443D]
                                   bg-[#F1E3DD]/20 placeholder:text-[#52443D]/40
                                   focus:outline-none focus:ring-2 focus:ring-[#BB7354]
                                   focus:border-[#BB7354] transition-colors resize-none"
                        rows={4}
                        placeholder="Masukkan alasan penolakan..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-[#DBC1B9] px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            onClose();
                            setReason("");
                        }}
                        className="px-4 py-2 text-sm font-semibold text-[#52443D]
                                   bg-[#F1E3DD]/60 rounded-lg hover:bg-[#F1E3DD]
                                   transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => {
                            if (reason.trim()) {
                                onConfirm(reason);
                                setReason("");
                            }
                        }}
                        disabled={!reason.trim()}
                        className="px-4 py-2 text-sm font-semibold text-white
                                   bg-[#6D2615] rounded-lg hover:bg-[#6D2615]/90
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-colors shadow-sm"
                    >
                        Konfirmasi
                    </button>
                </div>
            </div>
        </div>
    );
}