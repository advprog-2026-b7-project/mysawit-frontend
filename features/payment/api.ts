import apiClient from "@/services/apiClient"; // Hapus kurung kurawalnya
import { Payroll } from "./types";

// Fungsi untuk mengambil semua data payroll dari database
export const getPayrolls = async (): Promise<Payroll[]> => {
    try {
        const response = await apiClient.get('/api/payroll/list');
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data payroll:", error);
        return [];
    }
};

// (Opsional) Fungsi jika kamu ingin menambah pemicu bayar dari frontend nanti
export const triggerPayment = async (workerId: string, amount: number) => {
    try {
        const response = await apiClient.get('/test/pay', {
            params: {
                workerId: workerId,
                amount: amount
            }
        });
        return response.data;
    } catch (error) {
        console.error("Gagal memicu pembayaran:", error);
        throw error;
    }
};