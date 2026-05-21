export interface HarvestCreateRequest {
  weightKg: number;
  notes: string;
}

export interface HarvestResponse {
  id: string;
  plantationId: string;
  buruhId: string;
  buruhName: string;
  weightKg: number;
  notes: string;
  harvestDate: string;
  status: string;
  submittedAt: string;
  photoUrls?: string[];
}

export interface ApiSuccessResponse<T> {
  status: string;
  data: T;
}
