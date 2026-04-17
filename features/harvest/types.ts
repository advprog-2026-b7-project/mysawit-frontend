export interface HarvestCreateRequest {
  plantationId: string;
  buruhId: string;
  weightKg: number;
  description: string;
}

export interface HarvestResponse {
  id: string;
  plantationId: string;
  buruhId: string;
  weightKg: number;
  description: string;
  status: string;
  createdAt: string;
  photoUrls?: string[];
}
