export type HarvestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApproveHarvestResponse {
  id: string;
  status: HarvestStatus;
  approvedBy: string;
  approvedAt: string;
  payrollStatus: string;
}

export interface RejectHarvestResponse {
  id: string;
  status: HarvestStatus;
  rejectionReason: string;
  rejectedBy: string;
  rejectedAt: string;
}

export interface HarvestHistoryItem {
  id: string;
  plantationId?: string;
  buruhId: string;
  buruhName: string;
  weightKg: number;
  notes: string;
  status: HarvestStatus;
  rejectionReason?: string | null;
  harvestDate?: string;
  createdAt?: string;
  reviewedAt?: string | null;
  submittedAt?: string;
  photoUrls?: string[];
}

export interface HarvestPageResponse {
  content: HarvestHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface HarvestHistoryFilters {
  page?: number;
  size?: number;
  status?: HarvestStatus | "";
  startDate?: string;
  endDate?: string;
  buruhName?: string;
}
