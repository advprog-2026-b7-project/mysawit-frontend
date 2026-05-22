import axios from "axios";
import paymentClient from "@/services/paymentClient";
import payrollClient from "@/services/payrollClient";
import type {
  ApiSuccessResponse,
  CreatePayrollRequest,
  PayrollListResponse,
  PayrollResponse,
  PayrollType,
  WageSettings,
} from "./types";

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const message = data?.message || data?.error;
    if (message) return String(message);
  }
  return error instanceof Error ? error.message : "Unknown error";
}

class PaymentApiClient {
  // ─── Wage Settings ──────────────────────────────────────────────────────

  async getWageSettings(): Promise<WageSettings> {
    try {
      const res = await paymentClient.get<ApiSuccessResponse<WageSettings>>(
        "wage-settings"
      );
      return res.data.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async updateWageSettings(
    settings: Partial<WageSettings>
  ): Promise<WageSettings> {
    try {
      const res = await paymentClient.patch<ApiSuccessResponse<WageSettings>>(
        "wage-settings",
        settings
      );
      return res.data.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  // ─── Payroll ─────────────────────────────────────────────────────────────

  async listPayrolls(
    page = 0,
    size = 20
  ): Promise<PayrollListResponse> {
    try {
      const res = await payrollClient.get<PayrollListResponse>("list", {
        params: { page, size },
      });
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getPayrollByType(
    payrollType: PayrollType,
    page = 0,
    size = 20
  ): Promise<PayrollListResponse> {
    try {
      const res = await payrollClient.get<PayrollListResponse>(
        `by-type/${payrollType}`,
        { params: { page, size } }
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getPayrollByWorker(workerId: string): Promise<PayrollResponse[]> {
    try {
      const res = await payrollClient.get<PayrollResponse[]>(
        `by-worker/${workerId}`
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getPayrollStatus(id: string): Promise<PayrollResponse> {
    try {
      const res = await payrollClient.get<PayrollResponse>(
        `${id}/status`
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async approvePayroll(id: string): Promise<PayrollResponse> {
    try {
      const res = await payrollClient.patch<ApiSuccessResponse<PayrollResponse>>(
        `${id}/approve`
      );
      return res.data.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async rejectPayroll(id: string, note?: string): Promise<PayrollResponse> {
    try {
      const res = await payrollClient.patch<ApiSuccessResponse<PayrollResponse>>(
        `${id}/reject`,
        { note }
      );
      return res.data.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async createHarvestPayroll(
    request: CreatePayrollRequest
  ): Promise<PayrollResponse> {
    try {
      const res = await payrollClient.post<ApiSuccessResponse<PayrollResponse>>(
        "harvest/create",
        request
      );
      return res.data.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async createDeliveryPayroll(
    request: CreatePayrollRequest
  ): Promise<PayrollResponse> {
    try {
      const res = await payrollClient.post<ApiSuccessResponse<PayrollResponse>>(
        "delivery/create",
        request
      );
      return res.data.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }
}

export const paymentApiClient = new PaymentApiClient();
