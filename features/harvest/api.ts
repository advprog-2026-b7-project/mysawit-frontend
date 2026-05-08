import harvestServiceClient from "@/services/harvestClient";
import { getApiErrorMessage } from "@/lib/apiError";
import type {
  ApiSuccessResponse,
  HarvestCreateRequest,
  HarvestHistoryFilters,
  HarvestPageResponse,
  HarvestResponse,
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
      const response = await harvestServiceClient.post<HarvestResponse>(
        "/api/v1/harvests",
        formData
      );

      return response.data;
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
