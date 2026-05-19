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

export interface PlantationUpdateRequest {
  name?: string;
  area?: number;
  coordinates?: Coordinate[];
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

export interface PlantationListItemResponse {
  id: string;
  name: string;
  code: string;
  area: number;
  mandorName?: string | null;
  driverCount: number;
  createdAt?: string;
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

export interface PlantationDetailResponse {
  id: string;
  name: string;
  code: string;
  area: number;
  coordinates: Coordinate[];
  mandor?: MandorSummary | null;
  drivers: PageResponse<DriverSummary>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MandorAssignmentResponse {
  plantationId: string;
  mandor?: MandorSummary | null;
  assignedAt?: string | null;
}

export interface DriverAssignmentResponse {
  plantationId: string;
  driver?: DriverSummary | null;
  assignedAt?: string | null;
}

export interface PlantationListFilters {
  name?: string;
  code?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PlantationDetailFilters {
  driverName?: string;
  page?: number;
  size?: number;
}

export interface ReassignPlantationRequest {
  reassignToPlantationId?: string;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

export interface ApiSuccessMessageResponse {
  status: "success";
  message: string;
}
