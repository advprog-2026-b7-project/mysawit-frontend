import authClient from "@/services/authClient";
import type { 
  UserProfile, 
  GetUsersFiltersRequest, 
  MeResponse,
  CreateAssignmentRequest,
  AssignmentResponse,
  ReassignmentRequest,
  ReassignmentResponse
} from "./types";

// Get current user profile
export const getCurrentUserProfileApi = async (): Promise<MeResponse> => {
  const res = await authClient.get("/api/auth/me");
  return res.data;
};

// Get user profile by ID (for admin viewing other users)
export const getUserProfileApi = async (userId: string): Promise<MeResponse> => {
  const res = await authClient.get(`/api/auth/profile/${userId}`);
  return res.data;
};

// Get all users with filters (admin only)
export const getAllUsersApi = async (filters?: GetUsersFiltersRequest) => {
  const params = new URLSearchParams();
  
  if (filters?.name) {
    params.append("name", filters.name);
  }
  if (filters?.email) {
    params.append("email", filters.email);
  }
  if (filters?.role) {
    params.append("role", filters.role);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/admin/users?${queryString}` : "/api/admin/users";
  
  const res = await authClient.get(url);
  return res.data;
};

// Get users by role (admin only)
export const getUsersByRoleApi = async (role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR") => {
  const res = await authClient.get("/api/admin/users", {
    params: { role },
  });
  return res.data;
};

// Assignment Management APIs
export const createAssignmentApi = async (request: CreateAssignmentRequest): Promise<AssignmentResponse> => {
  const res = await authClient.post("/api/assignments", request);
  return res.data;
};

export const getAllAssignmentsApi = async (): Promise<AssignmentResponse[]> => {
  const res = await authClient.get("/api/assignments");
  return res.data;
};

export const getAssignmentByIdApi = async (id: string): Promise<AssignmentResponse> => {
  const res = await authClient.get(`/api/assignments/${id}`);
  return res.data;
};

export const getAssignmentsByBuruhApi = async (buruhId: string): Promise<AssignmentResponse[]> => {
  const res = await authClient.get(`/api/assignments/buruh/${buruhId}`);
  return res.data;
};

export const getAssignmentsByMandorApi = async (mandorId: string): Promise<AssignmentResponse[]> => {
  const res = await authClient.get(`/api/assignments/mandor/${mandorId}`);
  return res.data;
};

export const deleteAssignmentApi = async (id: string): Promise<void> => {
  await authClient.delete(`/api/assignments/${id}`);
};

export const reassignmentApi = async (assignmentId: string, request: ReassignmentRequest): Promise<ReassignmentResponse> => {
  const res = await authClient.post(`/api/assignments/${assignmentId}/reassign`, request);
  return res.data;
};
