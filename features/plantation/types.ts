export type Coordinate = [number, number];

export interface PlantationCreateRequest {
  name: string;
  code: string;
  area: number;
  coordinates: Coordinate[];
}

export interface PlantationUpdateRequest {
  name?: string;
  area?: number;
  coordinates?: Coordinate[];
}

export interface MandorSummary {
  id: string;
  name: string;
  certificationNumber?: string | null;
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
  coordinates: Coordinate[];
  mandor?: MandorSummary | null;
  createdAt?: string;
}

export interface PlantationUpdateResponse {
  id: string;
  name: string;
  code: string;
  area: number;
  coordinates: Coordinate[];
  updatedAt?: string;
}

export interface MandorAssignmentResponse {
  plantationId: string;
  mandor: MandorSummary;
  assignedAt: string;
}

export interface DriverAssignmentResponse {
  plantationId: string;
  driver: DriverSummary;
  assignedAt: string;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

export interface ApiSuccessMessageResponse {
  status: "success";
  message: string;
}
