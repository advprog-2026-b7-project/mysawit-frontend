export type Coordinate = [number, number];

export interface PageResponse<T> {
	content: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
}

export interface PlantationCreateRequest {
	name: string;
	code: string;
	area: number;
	coordinates: Coordinate[];
}

export interface MandorSummary {
	id: string;
	name: string;
	email?: string | null;
	certificationNumber?: string | null;
}

export interface DriverSummary {
	id: string;
	name: string;
	email?: string | null;
}

export interface PlantationResponse {
	id: string;
	name: string;
	code: string;
	area: number;
	coordinates: Coordinate[];
	mandor?: MandorSummary | null;
	createdAt?: string;
}

// Shape returned by GET /api/v1/plantations (list) — flat mandor name, no nested object
export interface PlantationListItem {
	id: string;
	name: string;
	code: string;
	area: number;
	mandorName?: string | null;
	driverCount?: number;
	createdAt?: string;
}

export interface PlantationDetailResponse extends PlantationResponse {
	drivers: PageResponse<DriverSummary>;
	updatedAt?: string;
}

export interface PlantationListFilters {
	name?: string;
	code?: string;
}

export interface AssignMandorRequest {
	mandorId: string;
}

export interface AssignDriverRequest {
	driverId: string;
}

export interface ReassignPlantationRequest {
	reassignToPlantationId: string;
}
