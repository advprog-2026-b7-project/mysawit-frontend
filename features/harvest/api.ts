import axios from "axios";
import harvestServiceClient from "@/services/harvestClient";
import type {
  ApiSuccessResponse,
  HarvestCreateRequest,
  HarvestResponse,
} from "./types";

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const message = data?.message || data?.error;
    const key = data?.errorKey || (Array.isArray(data?.errors) ? data.errors[0] : null);
    if (message && key) {
      return `${key}: ${message}`;
    }
    if (message) {
      return message;
    }
  }
  return error instanceof Error ? error.message : "Unknown error";
}

class HarvestClient {
  async submitHarvest(
    request: HarvestCreateRequest,
    photos?: File[]
  ): Promise<HarvestResponse> {
    const formData = new FormData();
    formData.append("weightKg", String(request.weightKg));
    formData.append("notes", request.notes);

    if (photos && photos.length > 0) {
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });
    }

    try {
      const response = await harvestServiceClient.post<
        ApiSuccessResponse<HarvestResponse>
      >(
        "v1/harvests",
        formData
      );

      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}

export const harvestClient = new HarvestClient();
