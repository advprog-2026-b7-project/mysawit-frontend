import axios from "axios";
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

function extractErrorMessage(err: unknown): string {
	if (axios.isAxiosError(err)) {
		const serverMsg =
			err.response?.data?.message ||
			(Array.isArray(err.response?.data?.details) && err.response?.data?.details[0]?.detail) ||
			err.response?.data?.error;
		if (serverMsg) return serverMsg;
		return `Server error ${err.response?.status ?? "unknown"}: ${err.message}`;
	}
	return err instanceof Error ? err.message : "Unknown error";
}

class PlantationClient {
	async getAll(filters?: PlantationListFilters): Promise<PlantationResponse[]> {
		const params = new URLSearchParams();
		if (filters?.name) params.append("name", filters.name);
		if (filters?.code) params.append("code", filters.code);
		const qs = params.toString();
		const url = qs ? `/api/v1/plantations?${qs}` : "/api/v1/plantations";
		try {
			const response = await plantationServiceClient.get<ApiSuccessResponse<PlantationResponse[]>>(url);
			return response.data.data;
		} catch (err) {
			throw new Error(extractErrorMessage(err));
		}
	}

	async getById(id: string): Promise<PlantationDetailResponse> {
		try {
			const response = await plantationServiceClient.get<ApiSuccessResponse<PlantationDetailResponse>>(
				`/api/v1/plantations/${id}`
			);
			return response.data.data;
		} catch (err) {
			throw new Error(extractErrorMessage(err));
		}
	}

	async createPlantation(request: PlantationCreateRequest): Promise<PlantationResponse> {
		try {
			const response = await plantationServiceClient.post<ApiSuccessResponse<PlantationResponse>>(
				"/api/v1/plantations",
				request
			);
			return response.data.data;
		} catch (err) {
			throw new Error(extractErrorMessage(err));
		}
	}

	async assignMandor(plantationId: string, request: AssignMandorRequest): Promise<void> {
		try {
			await plantationServiceClient.post(`/api/v1/plantations/${plantationId}/mandor`, request);
		} catch (err) {
			throw new Error(extractErrorMessage(err));
		}
	}

	async unassignMandor(plantationId: string): Promise<void> {
		try {
			await plantationServiceClient.delete(`/api/v1/plantations/${plantationId}/mandor`);
		} catch (err) {
			throw new Error(extractErrorMessage(err));
		}
	}

	async assignDriver(plantationId: string, request: AssignDriverRequest): Promise<void> {
		try {
			await plantationServiceClient.post(`/api/v1/plantations/${plantationId}/drivers`, request);
		} catch (err) {
			throw new Error(extractErrorMessage(err));
		}
	}

	async unassignDriver(plantationId: string, driverId: string): Promise<void> {
		try {
			await plantationServiceClient.delete(`/api/v1/plantations/${plantationId}/drivers/${driverId}`);
		} catch (err) {
			throw new Error(extractErrorMessage(err));
		}
	}
}

export const plantationClient = new PlantationClient();
