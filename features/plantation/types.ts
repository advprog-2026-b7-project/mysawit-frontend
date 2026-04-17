export interface Coordinate {
	latitude: number;
	longitude: number;
}

export interface PlantationCreateRequest {
	plantationCode: string;
	plantationName: string;
	areaSize: number;
	coordinates: Coordinate[];
}

export interface PlantationResponse {
	id: string;
	plantationCode: string;
	plantationName: string;
	areaSize: number;
	coordinates: Coordinate[];
	createdAt?: string;
}
