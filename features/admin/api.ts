import authClient from "@/services/authClient";
import plantationClient from "@/services/plantationClient";

export type Role = "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";

export interface MeResponse {
  id: string;
  email: string;
  username: string;
  nama?: string;
  role: Role;
  mandorCertificationNumber?: string | null;
  mandorId?: string | null;
  walletBalance?: number;
  authProvider?: "LOCAL" | "GOOGLE";
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  nama?: string;
  email: string;
  role: Role;
  mandorCertificationNumber?: string | null;
  mandorId?: string | null;
  walletBalance?: number;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Assignment {
  id: string;
  buruhId: string;
  buruhNama?: string;
  buruhName?: string;
  mandorId: string;
  mandorNama?: string;
  mandorName?: string;
  assignedAt?: string;
  createdAt?: string;
  reassignedAt?: string | null;
}

export interface UserFilters {
  name?: string;
  email?: string;
  role?: Role;
  page?: number;
  size?: number;
}

function unwrap<T>(payload: unknown): T {
  const data = payload as { data?: T };
  return data && "data" in data ? (data.data as T) : (payload as T);
}

export async function getMe(): Promise<MeResponse> {
  const response = await authClient.get("/api/auth/me");
  return unwrap<MeResponse>(response.data);
}

export async function getUsers(filters: UserFilters = {}): Promise<PageResponse<AdminUser>> {
  const response = await authClient.get("/api/admin/users", { params: filters });
  const unwrapped = unwrap<PageResponse<AdminUser>>(response.data);
  if (Array.isArray(unwrapped)) {
    return {
      content: unwrapped,
      page: filters.page ?? 0,
      size: filters.size ?? unwrapped.length,
      totalElements: unwrapped.length,
      totalPages: 1,
    };
  }
  return unwrapped;
}

export async function getUserById(id: string): Promise<AdminUser> {
  const response = await authClient.get(`/api/admin/users/${id}`);
  return unwrap<AdminUser>(response.data);
}

export async function deleteUser(id: string): Promise<void> {
  await authClient.delete(`/api/admin/users/${id}`);
}

export async function getBuruhAssignment(id: string): Promise<Assignment | null> {
  try {
    const response = await authClient.get(`/api/assignments/buruh/${id}`);
    return unwrap<Assignment>(response.data);
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw error;
  }
}

export async function getAssignmentCount(): Promise<number> {
  const response = await authClient.get("/api/assignments", { params: { page: 0, size: 1 } });
  const data = unwrap<PageResponse<Assignment>>(response.data);
  return data.totalElements ?? (Array.isArray(data) ? data.length : 0);
}

export async function getPlantationCount(): Promise<number> {
  const response = await plantationClient.get("/api/v1/plantations");
  const data = unwrap<unknown>(response.data);
  return Array.isArray(data) ? data.length : 0;
}
