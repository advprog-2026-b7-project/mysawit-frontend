export interface PlantationCreateRequest {
	code: string;
	name: string;
	location: string;
	areaHectares: number;
	treeCount: number;
	managerName?: string;
	notes?: string;
}

export interface PlantationResponse {
	id: string;
	code: string;
	name: string;
	location: string;
	areaHectares: number;
	treeCount: number;
	managerName?: string;
	notes?: string;
	status?: string;
	createdAt?: string;
}
