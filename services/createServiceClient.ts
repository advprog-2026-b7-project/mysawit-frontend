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

  // 401 guard: clear stale token and redirect to /login.
  // Only redirect when a token was present (avoids redirect loop on /login page).
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        typeof window !== "undefined" &&
        error?.response?.status === 401
      ) {
        const token = localStorage.getItem("token");
        if (token) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
