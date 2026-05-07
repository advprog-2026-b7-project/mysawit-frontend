import plantationServiceClient from "@/services/plantationClient";
import { getApiErrorMessage } from "@/lib/apiError";
import type {
  ApiSuccessMessageResponse,
  ApiSuccessResponse,
  DriverAssignmentResponse,
  MandorAssignmentResponse,
  PlantationCreateRequest,
  PlantationResponse,
  PlantationUpdateRequest,
  PlantationUpdateResponse,
} from "./types";

class PlantationClient {
  async createPlantation(
    request: PlantationCreateRequest
  ): Promise<PlantationResponse> {
    try {
      const response = await plantationServiceClient.post<
        ApiSuccessResponse<PlantationResponse>
      >("/api/v1/plantations", request);

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }

  async updatePlantation(
    plantationId: string,
    request: PlantationUpdateRequest
  ): Promise<PlantationUpdateResponse> {
    try {
      const response = await plantationServiceClient.put<
        ApiSuccessResponse<PlantationUpdateResponse>
      >(`/api/v1/plantations/${plantationId}`, request);

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }

  async deletePlantation(plantationId: string): Promise<string> {
    try {
      const response = await plantationServiceClient.delete<ApiSuccessMessageResponse>(
        `/api/v1/plantations/${plantationId}`
      );

      return response.data.message;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }

  async assignMandor(
    plantationId: string,
    mandorId: string
  ): Promise<MandorAssignmentResponse> {
    try {
      const response = await plantationServiceClient.post<
        ApiSuccessResponse<MandorAssignmentResponse>
      >(`/api/v1/plantations/${plantationId}/mandor`, { mandorId });

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }

  async assignDriver(
    plantationId: string,
    driverId: string
  ): Promise<DriverAssignmentResponse> {
    try {
      const response = await plantationServiceClient.post<
        ApiSuccessResponse<DriverAssignmentResponse>
      >(`/api/v1/plantations/${plantationId}/drivers`, { driverId });

      return response.data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }
}

export const plantationClient = new PlantationClient();
