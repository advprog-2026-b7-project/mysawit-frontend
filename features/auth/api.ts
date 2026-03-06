import apiClient from "@/services/apiClient";
import type { LoginRequest, RegisterRequest } from "./types";

export const loginApi = async (data: LoginRequest) => {
  const res = await apiClient.post("/api/auth/login", data);
  return res.data;
};

export const registerApi = async (data: RegisterRequest) => {
  const res = await apiClient.post("/api/auth/register", data);
  return res.data;
};

export const logoutApi = async () => {
  const res = await apiClient.post("/api/auth/logout");
  return res.data;
};