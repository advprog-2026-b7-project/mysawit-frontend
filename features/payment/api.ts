import paymentClient from "../../services/paymentClient";

export const getPayrolls = async () => {
    const response = await paymentClient.get("/api/payroll/list");
    return response.data;
};

export const approvePayroll = async (id: string) => {
    return await paymentClient.put(`/api/payroll/${id}/approve`);
};

export const rejectPayroll = async (id: string, reason: string) => {
    // Kirim alasan penolakan dalam body JSON sesuai request backend
    return await paymentClient.put(`/api/payroll/${id}/reject`, { reason });
};