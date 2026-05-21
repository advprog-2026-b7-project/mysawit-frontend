import axios from "axios";
import type { AxiosInstance } from "axios";

export function createServiceClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      delete (config.headers as Record<string, string>)["Content-Type"];
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (typeof window !== "undefined" && error?.response?.status === 401) {
        const url: string = error?.config?.url ?? "";
        const isAuthEndpoint =
          url.includes("/api/auth/login") ||
          url.includes("/api/auth/register") ||
          url.includes("/api/auth/google-login");
        if (!isAuthEndpoint) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
