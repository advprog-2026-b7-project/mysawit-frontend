import harvestServiceClient from "@/services/harvestClient";
import type { HarvestCreateRequest, HarvestResponse } from "./types";

class HarvestClient {
  async submitHarvest(
    request: HarvestCreateRequest,
    photos?: File[]
  ): Promise<HarvestResponse> {
    const formData = new FormData();

    // Add request data as JSON blob
    const dataBlob = new Blob([JSON.stringify(request)], {
      type: "application/json",
    });
    formData.append("data", dataBlob);

    // Add photos if provided
    if (photos && photos.length > 0) {
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });
    }

    const response = await harvestServiceClient.post<HarvestResponse>(
      "/harvests",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }
}

export const harvestClient = new HarvestClient();
