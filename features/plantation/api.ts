import apiClient from "@/services/apiClient";
import type { PlantationCreateRequest, PlantationResponse } from "./types";

class PlantationClient {
	async createPlantation(
		request: PlantationCreateRequest
	): Promise<PlantationResponse> {
		const response = await apiClient.post<PlantationResponse>(
			"/plantations",
			request
		);

		return response.data;
	}
}

export const plantationClient = new PlantationClient();
