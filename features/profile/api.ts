import axios from "axios";
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

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const serverMsg =
      err.response?.data?.message ||
      (Array.isArray(err.response?.data?.details) && err.response?.data?.details[0]?.detail) ||
      err.response?.data?.error;
    if (serverMsg) return serverMsg;
    return `Server error ${err.response?.status ?? "unknown"}: ${err.message}`;
  }
  return err instanceof Error ? err.message : "Unknown error";
}

// Get current user profile
export const getCurrentUserProfileApi = async (): Promise<MeResponse> => {
  try {
    const res = await authClient.get("/api/auth/me");
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

// Get user profile by ID (for admin viewing other users)
export const getUserProfileApi = async (userId: string): Promise<MeResponse> => {
  try {
    const res = await authClient.get(`/api/auth/profile/${userId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

// Get all users with filters (admin only)
export const getAllUsersApi = async (filters?: GetUsersFiltersRequest): Promise<UserProfile[]> => {
  const params = new URLSearchParams();

  if (filters?.name) params.append("name", filters.name);
  if (filters?.email) params.append("email", filters.email);
  if (filters?.role) params.append("role", filters.role);

  const queryString = params.toString();
  const url = queryString ? `/api/admin/users?${queryString}` : "/api/admin/users";

  try {
    const res = await authClient.get(url);
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

// Get users by role (admin only)
export const getUsersByRoleApi = async (role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR"): Promise<UserProfile[]> => {
  try {
    const res = await authClient.get("/api/admin/users", {
      params: { role },
    });
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

// Assignment Management APIs
export const createAssignmentApi = async (request: CreateAssignmentRequest): Promise<AssignmentResponse> => {
  try {
    const res = await authClient.post("/api/assignments", request);
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAllAssignmentsApi = async (): Promise<AssignmentResponse[]> => {
  try {
    const res = await authClient.get("/api/assignments");
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAssignmentByIdApi = async (id: string): Promise<AssignmentResponse> => {
  try {
    const res = await authClient.get(`/api/assignments/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAssignmentsByBuruhApi = async (buruhId: string): Promise<AssignmentResponse[]> => {
  try {
    const res = await authClient.get(`/api/assignments/buruh/${buruhId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAssignmentsByMandorApi = async (mandorId: string): Promise<AssignmentResponse[]> => {
  try {
    const res = await authClient.get(`/api/assignments/mandor/${mandorId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const deleteAssignmentApi = async (id: string): Promise<void> => {
  try {
    await authClient.delete(`/api/assignments/${id}`);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const reassignmentApi = async (assignmentId: string, request: ReassignmentRequest): Promise<ReassignmentResponse> => {
  try {
    const res = await authClient.post(`/api/assignments/${assignmentId}/reassign`, request);
    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const deleteUserApi = async (userId: string): Promise<void> => {
  try {
    await authClient.delete(`/api/admin/users/${userId}`);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};
