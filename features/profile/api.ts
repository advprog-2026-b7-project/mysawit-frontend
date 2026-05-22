import axios from "axios";
import authClient from "@/services/authClient";
import type {
  UserProfile,
  GetUsersFiltersRequest,
  MeResponse,
  CreateAssignmentRequest,
  AssignmentResponse,
  ReassignmentRequest,
  ReassignmentResponse,
  PageResponse
} from "./types";

interface ApiEnvelope<T> {
  status?: string;
  data?: T;
}

interface MandorAssignmentsResponse {
  mandorId: string;
  mandorNama?: string;
  content: RawAssignmentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface RawAssignmentResponse {
  id: string;
  buruhId: string;
  buruhNama?: string;
  buruhName?: string;
  mandorId: string;
  mandorNama?: string;
  mandorName?: string;
  plantationId?: string | null;
  assignedAt?: string;
  createdAt?: string;
  reassignedAt?: string | null;
  updatedAt?: string;
}

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

function unwrap<T>(payload: unknown): T {
  const envelope = payload as ApiEnvelope<T>;
  return envelope && typeof envelope === "object" && "data" in envelope
    ? (envelope.data as T)
    : (payload as T);
}

function pageResponse<T>(payload: unknown, fallbackPage = 0, fallbackSize = 20): PageResponse<T> {
  const unwrapped = unwrap<PageResponse<T> | T[]>(payload);
  if (Array.isArray(unwrapped)) {
    return {
      content: unwrapped,
      page: fallbackPage,
      size: fallbackSize,
      totalElements: unwrapped.length,
      totalPages: unwrapped.length === 0 ? 0 : 1,
    };
  }
  return {
    content: unwrapped?.content ?? [],
    page: unwrapped?.page ?? fallbackPage,
    size: unwrapped?.size ?? fallbackSize,
    totalElements: unwrapped?.totalElements ?? unwrapped?.content?.length ?? 0,
    totalPages: unwrapped?.totalPages ?? 0,
  };
}

function normalizeAssignment(raw: RawAssignmentResponse): AssignmentResponse {
  return {
    id: raw.id,
    buruhId: raw.buruhId,
    buruhName: raw.buruhName ?? raw.buruhNama ?? raw.buruhId,
    mandorId: raw.mandorId,
    mandorName: raw.mandorName ?? raw.mandorNama ?? raw.mandorId,
    plantationId: raw.plantationId ?? null,
    assignedAt: raw.assignedAt,
    createdAt: raw.createdAt ?? raw.assignedAt ?? raw.reassignedAt ?? "",
    updatedAt: raw.updatedAt,
    reassignedAt: raw.reassignedAt ?? null,
  };
}

// Get current user profile
export const getCurrentUserProfileApi = async (): Promise<MeResponse> => {
  try {
    const res = await authClient.get("/api/auth/me");
    return unwrap<MeResponse>(res.data);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

// Get user profile by ID (for admin viewing other users)
export const getUserProfileApi = async (userId: string): Promise<MeResponse> => {
  try {
    const res = await authClient.get(`/api/auth/profile/${userId}`);
    return unwrap<MeResponse>(res.data);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

// Get all users with filters (admin only)
export const getAllUsersPageApi = async (
  filters: GetUsersFiltersRequest = {},
): Promise<PageResponse<UserProfile>> => {
  const params = new URLSearchParams();

  if (filters?.name) params.append("name", filters.name);
  if (filters?.email) params.append("email", filters.email);
  if (filters?.role) params.append("role", filters.role);
  params.append("page", String(filters.page ?? 0));
  params.append("size", String(filters.size ?? 20));

  const queryString = params.toString();
  const url = queryString ? `/api/admin/users?${queryString}` : "/api/admin/users";

  try {
    const res = await authClient.get(url);
    return pageResponse<UserProfile>(res.data, filters.page ?? 0, filters.size ?? 20);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAllUsersApi = async (filters?: GetUsersFiltersRequest): Promise<UserProfile[]> => {
  const page = await getAllUsersPageApi(filters);
  return page.content;
};

// Get users by role (admin only)
export const getUsersByRolePageApi = async (
  role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR",
  page = 0,
  size = 20,
): Promise<PageResponse<UserProfile>> => {
  try {
    const res = await authClient.get("/api/admin/users", {
      params: { role, page, size },
    });
    return pageResponse<UserProfile>(res.data, page, size);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getUsersByRoleApi = async (
  role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR",
): Promise<UserProfile[]> => {
  const page = await getUsersByRolePageApi(role);
  return page.content;
};

// Assignment Management APIs
export const createAssignmentApi = async (request: CreateAssignmentRequest): Promise<AssignmentResponse> => {
  try {
    const res = await authClient.post("/api/assignments", request);
    return normalizeAssignment(unwrap<RawAssignmentResponse>(res.data));
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAllAssignmentsPageApi = async (
  page = 0,
  size = 20,
): Promise<PageResponse<AssignmentResponse>> => {
  try {
    const res = await authClient.get("/api/assignments", { params: { page, size } });
    const data = pageResponse<RawAssignmentResponse>(res.data, page, size);
    return {
      ...data,
      content: data.content.map(normalizeAssignment),
    };
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAllAssignmentsApi = async (): Promise<AssignmentResponse[]> => {
  const page = await getAllAssignmentsPageApi();
  return page.content;
};

export const getAssignmentByIdApi = async (id: string): Promise<AssignmentResponse> => {
  try {
    const res = await authClient.get(`/api/assignments/${id}`);
    return normalizeAssignment(unwrap<RawAssignmentResponse>(res.data));
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAssignmentsByBuruhApi = async (buruhId: string): Promise<AssignmentResponse[]> => {
  try {
    const res = await authClient.get(`/api/assignments/buruh/${buruhId}`);
    return [normalizeAssignment(unwrap<RawAssignmentResponse>(res.data))];
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAssignmentsByMandorPageApi = async (
  mandorId: string,
  page = 0,
  size = 20,
): Promise<PageResponse<AssignmentResponse>> => {
  try {
    const res = await authClient.get(`/api/assignments/mandor/${mandorId}`, {
      params: { page, size },
    });
    const data = unwrap<MandorAssignmentsResponse | RawAssignmentResponse[]>(res.data);
    if (Array.isArray(data)) {
      return pageResponse<AssignmentResponse>(data.map(normalizeAssignment), page, size);
    }
    return {
      content: (data?.content ?? []).map(normalizeAssignment),
      page: data?.page ?? page,
      size: data?.size ?? size,
      totalElements: data?.totalElements ?? data?.content?.length ?? 0,
      totalPages: data?.totalPages ?? 0,
    };
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

export const getAssignmentsByMandorApi = async (mandorId: string): Promise<AssignmentResponse[]> => {
  const page = await getAssignmentsByMandorPageApi(mandorId);
  return page.content;
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
    return unwrap<ReassignmentResponse>(res.data);
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
