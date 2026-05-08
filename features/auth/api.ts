import authClient from "@/services/authClient";
import type { LoginRequest, RegisterRequest } from "./types";

export const loginApi = async (data: LoginRequest) => {
  const res = await authClient.post("/api/auth/login", data);
  return res.data;
};

export const registerApi = async (data: RegisterRequest) => {
  const res = await authClient.post("/api/auth/register", data);
  return res.data;
};

export const googleLoginApi = async (idToken: string) => {
  const res = await authClient.post("/api/auth/google-login", { idToken });
  return res.data;
};

export const logoutApi = async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
  const res = await authClient.post("/api/auth/logout", { token });
  return res.data;
};