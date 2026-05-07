export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";
  mandorCertificationNumber?: string;
  mandorId?: string; // UUID reference to supervisor
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileResponse extends UserProfile {}

export interface MeResponse {
  id: string;
  email: string;
  username: string;
  role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";
  mandorCertificationNumber?: string | null;
  mandorId?: string | null;
}

export interface GetUsersFiltersRequest {
  name?: string;
  email?: string;
  role?: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";
}

export interface UserListResponse {
  data: UserProfile[];
  total: number;
}

// Assignment API Types
export interface CreateAssignmentRequest {
  buruhId: string;
  mandorId: string;
}

export interface AssignmentResponse {
  id: string;
  buruhId: string;
  buruhName: string;
  mandorId: string;
  mandorName: string;
  createdAt: string;
  updatedAt: string;
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
