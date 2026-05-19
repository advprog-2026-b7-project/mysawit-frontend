import harvestServiceClient from "@/services/harvestClient";
import { getApiErrorMessage } from "@/lib/apiError";
import type {
  ApiSuccessResponse,
  ApproveHarvestResponse,
  HarvestCreateRequest,
  HarvestHistoryFilters,
  HarvestPageResponse,
  HarvestResponse,
  RejectHarvestResponse,
} from "./types";

function cleanParams(filters: HarvestHistoryFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null)
  );
}

class HarvestClient {
  async submitHarvest(
    request: HarvestCreateRequest,
    photos: File[]
  ): Promise<HarvestResponse> {
    const formData = new FormData();
    formData.append("weightKg", String(request.weightKg));
    formData.append("notes", request.notes);

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    try {
      const response = await harvestServiceClient.post<
        ApiSuccessResponse<HarvestResponse>
      >(
        "/api/v1/harvests",
        formData
      );

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }

  async approveHarvest(harvestId: string): Promise<ApproveHarvestResponse> {
    try {
      const response = await harvestServiceClient.patch<
        ApiSuccessResponse<ApproveHarvestResponse>
      >(`/api/v1/harvests/${harvestId}/approve`);

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
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
      throw new Error(getApiErrorMessage(error));
    }
  }

  async getHarvestHistory(
    filters: HarvestHistoryFilters
  ): Promise<HarvestPageResponse> {
    try {
      const response = await harvestServiceClient.get<
        ApiSuccessResponse<HarvestPageResponse>
      >("/api/v1/harvests", {
        params: cleanParams(filters),
      });

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }

  async getHarvestHistoryByBuruhId(
    buruhId: string,
    filters: HarvestHistoryFilters
  ): Promise<HarvestPageResponse> {
    try {
      const response = await harvestServiceClient.get<
        ApiSuccessResponse<HarvestPageResponse>
      >(`/api/v1/users/${buruhId}/harvests`, {
        params: cleanParams(filters),
      });

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }
}

export const harvestClient = new HarvestClient();
