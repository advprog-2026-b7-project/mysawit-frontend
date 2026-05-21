import axios from "axios";
import type { AxiosInstance } from "axios";
import { getTokenCookie, deleteTokenCookie } from "./tokenCookie";

export function createServiceClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      if (config.data instanceof FormData) {
        delete (config.headers as Record<string, string>)["Content-Type"];
      }
      const token = getTokenCookie();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        typeof window !== "undefined" &&
        error?.response?.status === 401 &&
        baseURL === (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080")
      ) {
        const token = getTokenCookie();
        if (token) {
          deleteTokenCookie();
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
