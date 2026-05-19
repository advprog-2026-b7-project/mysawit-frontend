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
      // Let the browser set Content-Type with boundary for multipart
      if (config.data instanceof FormData) {
        delete (config.headers as Record<string, string>)["Content-Type"];
      }
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // 401 guard: only redirect to login if the auth service itself rejects the token.
  // Do NOT wipe the token here — a 401 from a downstream service (plantation, harvest, etc.)
  // does not mean the token is invalid globally.
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        typeof window !== "undefined" &&
        error?.response?.status === 401 &&
        baseURL === (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080")
      ) {
        const token = localStorage.getItem("token");
        if (token) {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
