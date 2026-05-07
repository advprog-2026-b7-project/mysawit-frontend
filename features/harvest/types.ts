export type HarvestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface HarvestCreateRequest {
  weightKg: number;
  notes: string;
}

export interface HarvestResponse {
  id: string;
  plantationId: string;
  buruhId: string;
  buruhName?: string | null;
  weightKg: number;
  notes: string;
  status: HarvestStatus;
  rejectionReason?: string | null;
  harvestDate?: string;
  createdAt?: string;
  reviewedAt?: string | null;
  photoUrls?: string[];
}

export interface HarvestPageResponse {
  content: HarvestResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface HarvestHistoryFilters {
  startDate?: string;
  endDate?: string;
  status?: HarvestStatus | "";
  buruhName?: string;
  page?: number;
  size?: number;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}
