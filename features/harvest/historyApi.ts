import axios from "axios";
import harvestServiceClient from "@/services/harvestClient";
import type {
  ApproveHarvestResponse,
  HarvestHistoryFilters,
  HarvestPageResponse,
  RejectHarvestResponse,
} from "./historyTypes";

interface ApiSuccessResponse<T> {
  status: string;
  data: T;
}

function normalizePage(data: HarvestPageResponse | HarvestPageResponse["content"]): HarvestPageResponse {
  if (Array.isArray(data)) {
    return {
      content: data,
      page: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
    };
  }
  return data;
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const message = data?.message || data?.error;
    const key = data?.errorKey || (Array.isArray(data?.errors) ? data.errors[0] : null);
    if (message && key) return `${key}: ${message}`;
    if (message) return message;
  }
  return error instanceof Error ? error.message : "Unknown error";
}

class HarvestHistoryClient {
  async getHarvestHistory(filters: HarvestHistoryFilters = {}): Promise<HarvestPageResponse> {
    try {
      const response = await harvestServiceClient.get<
        ApiSuccessResponse<HarvestPageResponse | HarvestPageResponse["content"]>
      >("/api/v1/harvests", {
        params: {
          page: filters.page ?? 0,
          size: filters.size ?? 20,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          buruhName: filters.buruhName || undefined,
        },
      });

      return normalizePage(response.data.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async getHarvestHistoryByBuruhId(
    buruhId: string,
    filters: Omit<HarvestHistoryFilters, "buruhName"> = {}
  ): Promise<HarvestPageResponse> {
    try {
      const response = await harvestServiceClient.get<
        ApiSuccessResponse<HarvestPageResponse | HarvestPageResponse["content"]>
      >(`/api/v1/users/${buruhId}/harvests`, {
        params: {
          page: filters.page ?? 0,
          size: filters.size ?? 20,
          status: filters.status || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
      });

      return normalizePage(response.data.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async getHarvestCount(filters: HarvestHistoryFilters = {}): Promise<number> {
    const page = await this.getHarvestHistory({ ...filters, page: 0, size: 1 });
    return page.totalElements ?? page.content.length;
  }

  async approveHarvest(harvestId: string): Promise<ApproveHarvestResponse> {
    try {
      const response = await harvestServiceClient.patch<
        ApiSuccessResponse<ApproveHarvestResponse>
      >(`/api/v1/harvests/${harvestId}/approve`);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async rejectHarvest(
    harvestId: string,
    rejectionReason: string
  ): Promise<RejectHarvestResponse> {
    try {
      const response = await harvestServiceClient.patch<
        ApiSuccessResponse<RejectHarvestResponse>
      >(`/api/v1/harvests/${harvestId}/reject`, { rejectionReason });
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}

export const harvestHistoryClient = new HarvestHistoryClient();
