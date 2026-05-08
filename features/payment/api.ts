import paymentClient from "@/services/paymentClient";
import { Payroll } from "./types";

export const getPayrolls = async (): Promise<Payroll[]> => {
    try {
        const response = await paymentClient.get('/api/payroll/list');
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data payroll:", error);
        return [];
    }
};

export const approvePayroll = async (id: string) => {
    return await paymentClient.put(`/api/payroll/${id}/approve`);
};

export const rejectPayroll = async (id: string, reason: string) => {
    return await paymentClient.put(`/api/payroll/${id}/reject`, { reason });
};

export const triggerPayment = async (workerId: string, amount: number) => {
    try {
        const response = await paymentClient.get('/test/pay', {
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