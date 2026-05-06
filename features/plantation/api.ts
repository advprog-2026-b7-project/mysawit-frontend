import plantationServiceClient from "@/services/plantationClient";
import type {
	AssignDriverRequest,
	AssignMandorRequest,
	PlantationCreateRequest,
	PlantationDetailResponse,
	PlantationListFilters,
	PlantationResponse,
} from "./types";

interface ApiSuccessResponse<T> {
	status: string;
	data: T;
}

class PlantationClient {
	async getAll(filters?: PlantationListFilters): Promise<PlantationResponse[]> {
		const params = new URLSearchParams();
		if (filters?.name) params.append("name", filters.name);
		if (filters?.code) params.append("code", filters.code);
		const qs = params.toString();
		const url = qs ? `/api/v1/plantations?${qs}` : "/api/v1/plantations";
		const response = await plantationServiceClient.get<ApiSuccessResponse<PlantationResponse[]>>(url);
		return response.data.data;
	}

	async getById(id: string): Promise<PlantationDetailResponse> {
		const response = await plantationServiceClient.get<ApiSuccessResponse<PlantationDetailResponse>>(
			`/api/v1/plantations/${id}`
		);
		return response.data.data;
	}

	async createPlantation(request: PlantationCreateRequest): Promise<PlantationResponse> {
		const response = await plantationServiceClient.post<ApiSuccessResponse<PlantationResponse>>(
			"/api/v1/plantations",
			request
		);
		return response.data.data;
	}

	async assignMandor(plantationId: string, request: AssignMandorRequest): Promise<void> {
		await plantationServiceClient.post(`/api/v1/plantations/${plantationId}/mandor`, request);
	}

	async unassignMandor(plantationId: string): Promise<void> {
		await plantationServiceClient.delete(`/api/v1/plantations/${plantationId}/mandor`);
	}

	async assignDriver(plantationId: string, request: AssignDriverRequest): Promise<void> {
		await plantationServiceClient.post(`/api/v1/plantations/${plantationId}/drivers`, request);
	}

	async unassignDriver(plantationId: string, driverId: string): Promise<void> {
		await plantationServiceClient.delete(`/api/v1/plantations/${plantationId}/drivers/${driverId}`);
	}
}

export const plantationClient = new PlantationClient();
