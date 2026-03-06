import axios from "axios";
import type { AxiosInstance } from "axios";

/**
 * Factory to create a service-specific axios instance.
 * Each instance has its own baseURL, JSON headers, and
 * automatic Bearer token injection from localStorage.
 */
export function createServiceClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return client;
}
