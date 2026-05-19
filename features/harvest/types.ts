export type HarvestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface HarvestCreateRequest {
  weightKg: number;
  notes: string;
}

export interface HarvestResponse {
  id: string;
  plantationId?: string | null;
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

export interface ApproveHarvestResponse {
  id: string;
  status: "APPROVED";
  approvedBy: string;
  approvedAt: string;
  payrollStatus: "QUEUED";
}

export interface RejectHarvestResponse {
  id: string;
  status: "REJECTED";
  rejectionReason?: string | null;
  rejectedBy: string;
  rejectedAt: string;
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
