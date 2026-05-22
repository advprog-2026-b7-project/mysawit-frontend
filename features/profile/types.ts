export interface UserProfile {
  id: string;
  username: string;
  nama?: string;
  email: string;
  role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";
  mandorCertificationNumber?: string | null;
  mandorId?: string | null; // UUID reference to supervisor
  createdAt?: string;
  updatedAt?: string;
}

export type UserProfileResponse = UserProfile;

export interface MeResponse {
  id: string;
  email: string;
  username: string;
  nama?: string;
  role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";
  mandorCertificationNumber?: string | null;
  mandorId?: string | null;
  createdAt?: string;
}

export interface GetUsersFiltersRequest {
  name?: string;
  email?: string;
  role?: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";
  page?: number;
  size?: number;
}

export interface UserListResponse {
  data: UserProfile[];
  total: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Assignment API Types
export interface CreateAssignmentRequest {
  buruhId: string;
  mandorId: string;
}

export interface AssignmentResponse {
  id: string;
  buruhId: string;
  buruhNama?: string;
  buruhName: string;
  mandorId: string;
  mandorNama?: string;
  mandorName: string;
  plantationId?: string | null;
  assignedAt?: string;
  createdAt: string;
  updatedAt?: string;
  reassignedAt?: string | null;
}

export interface ReassignmentRequest {
  newMandorId: string;
}

export interface ReassignmentResponse {
  assignmentId: string;
  buruhId: string;
  buruhName: string;
  oldMandorId: string;
  oldMandorName: string;
  newMandorId: string;
  newMandorName: string;
  reassignedAt: string;
}
