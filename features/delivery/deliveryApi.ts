import axios from "axios";
import deliveryClient from "@/services/deliveryClient";
import type {
  AdminRejectPayload,
  CreateShipmentPayload,
  DriverItem,
  ShipmentResponse,
} from "./deliveryTypes";

interface ApiSuccessResponse<T> {
  status: string;
  data: T;
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const d = error.response?.data;
    const msg = d?.message || d?.data?.message || d?.error;
    if (msg) return String(msg);
  }
  return error instanceof Error ? error.message : "Unknown error";
}

/** ISO-8601 datetime string expected by Spring @DateTimeFormat(iso = ISO.DATE_TIME) */
function toIsoDateTime(dateStr: string, endOfDay = false): string {
  return endOfDay ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
}

class DeliveryApiClient {
  // ─── MANDOR ───────────────────────────────────────────────────────────────

  // Paths are relative to the proxy base (/api/delivery).
  // The proxy prepends /api/ before forwarding, so "v1/deliveries/..."
  // maps to the backend's "/api/v1/deliveries/..." route.

  async createShipment(payload: CreateShipmentPayload): Promise<ShipmentResponse> {
    try {
      const res = await deliveryClient.post<ApiSuccessResponse<ShipmentResponse>>(
        "v1/deliveries",
        payload
      );
      return res.data.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getMyOngoing(): Promise<ShipmentResponse[]> {
    try {
      const res = await deliveryClient.get<ShipmentResponse[]>(
        "v1/deliveries/me/mandor/ongoing"
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async approveByMandor(shipmentId: string): Promise<ShipmentResponse> {
    try {
      const res = await deliveryClient.patch<ShipmentResponse>(
        `v1/deliveries/${shipmentId}/approve-mandor`
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async rejectByMandor(shipmentId: string, reason: string): Promise<ShipmentResponse> {
    try {
      const res = await deliveryClient.patch<ShipmentResponse>(
        `v1/deliveries/${shipmentId}/reject-mandor`,
        { reason }
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getMyPlantationId(): Promise<string> {
    try {
      const res = await deliveryClient.get<{ plantationId: string }>(
        "v1/deliveries/my-plantation"
      );
      return res.data.plantationId;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getAvailableDrivers(plantationId: string): Promise<DriverItem[]> {
    try {
      const res = await deliveryClient.get<DriverItem[]>(
        "v1/deliveries/drivers/available",
        { params: { plantationId } }
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getAvailableHarvestWeight(): Promise<number> {
    try {
      const res = await deliveryClient.get<number>(
        "v1/deliveries/harvest/approved-weight"
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  // ─── SUPIR ────────────────────────────────────────────────────────────────

  async getMyAssigned(): Promise<ShipmentResponse[]> {
    try {
      const res = await deliveryClient.get<ShipmentResponse[]>(
        "v1/deliveries/me/assigned"
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getMyHistory(startDate: string, endDate: string): Promise<ShipmentResponse[]> {
    try {
      const res = await deliveryClient.get<ShipmentResponse[]>(
        "v1/deliveries/me/history",
        {
          params: {
            startDate: toIsoDateTime(startDate, false),
            endDate: toIsoDateTime(endDate, true),
          },
        }
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async updateStatus(shipmentId: string, status: string): Promise<ShipmentResponse> {
    try {
      const res = await deliveryClient.patch<ShipmentResponse>(
        `v1/deliveries/${shipmentId}/status`,
        { status }
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  async getAdminPendingReview(
    startDate?: string,
    endDate?: string
  ): Promise<ShipmentResponse[]> {
    try {
      const res = await deliveryClient.get<ShipmentResponse[]>(
        "v1/deliveries/admin/pending-review",
        {
          params: {
            startDate: startDate ? toIsoDateTime(startDate, false) : undefined,
            endDate: endDate ? toIsoDateTime(endDate, true) : undefined,
          },
        }
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async approveByAdmin(shipmentId: string): Promise<ShipmentResponse> {
    try {
      const res = await deliveryClient.patch<ShipmentResponse>(
        `v1/deliveries/${shipmentId}/approve-admin`
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async rejectByAdmin(payload: AdminRejectPayload & { shipmentId: string }): Promise<ShipmentResponse> {
    const { shipmentId, ...body } = payload;
    try {
      const res = await deliveryClient.patch<ShipmentResponse>(
        `v1/deliveries/${shipmentId}/reject-admin`,
        body
      );
      return res.data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  }
}

export const deliveryApiClient = new DeliveryApiClient();
