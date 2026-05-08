export interface Coordinate {
	latitude: number;
	longitude: number;
}

export interface PlantationCreateRequest {
	name: string;
	code: string;
	area: number;
	coordinates: number[][];
}

export interface MandorSummary {
	id: string;
	name: string;
	certificationNumber?: string;
}

export interface DriverSummary {
	id: string;
	name: string;
}

export interface PlantationResponse {
	id: string;
	name: string;
	code: string;
	area: number;
	coordinates: number[][];
	mandor?: MandorSummary | null;
	createdAt?: string;
}

export interface PlantationDetailResponse extends PlantationResponse {
	drivers: DriverSummary[];
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
