import paymentClient from "@/services/paymentClient";
import { Payroll, Wallet, WageSettings } from "./types";

// ─── Payroll ─────────────────────────────────────────────────────────────────

interface GetPayrollsParams {
    tanggal?: string;
    status?: string;
    workerId?: string;
    page?: number;
    size?: number;
}

export const getPayrolls = async (params: GetPayrollsParams = {}) => {
    const response = await paymentClient.get("/api/payroll/list", { params });
    // Backend returns: { status, data: Page<Payroll> }
    if (response.data?.data?.content !== undefined) {
        return response.data.data; // kembalikan Page object (ada .content, .totalPages)
    }
    return response.data?.data ?? [];
};

export const getPayrollStatus = async (id: string) => {
    const response = await paymentClient.get(`/api/payroll/${id}/status`);
    return response.data?.data as { id: string; status: string };
};

export const approvePayroll = async (id: string) => {
    return await paymentClient.patch(`/api/payroll/${id}/approve`);
};

export const rejectPayroll = async (id: string, reason: string) => {
    return await paymentClient.patch(`/api/payroll/${id}/reject`, { reason });
};

// ─── Wallet ──────────────────────────────────────────────────────────────────

export const getWalletBalance = async (): Promise<Wallet> => {
    const response = await paymentClient.get("/api/wallet/balance");
    return response.data?.data as Wallet;
};

export const topUpWallet = async (amountSawitDollar: number): Promise<string> => {
    const response = await paymentClient.post("/api/wallet/topup", {
        amountSawitDollar,
    });
    // returns { data: { paymentUrl: "https://..." } }
    return response.data?.data?.paymentUrl as string;
};

// ─── Wage Settings ────────────────────────────────────────────────────────────

export const getWageSettings = async (): Promise<WageSettings> => {
    const response = await paymentClient.get("/api/payment/wage-settings");
    return response.data?.data as WageSettings;
};

export const updateWageSettings = async (settings: Omit<WageSettings, "id">) => {
    const response = await paymentClient.patch("/api/payment/wage-settings", settings);
    return response.data?.data as WageSettings;
};