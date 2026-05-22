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
        const rawUrl: string = error?.config?.url ?? "";
        const path = rawUrl.split("?")[0];
        const isSessionEndpoint =
          path.endsWith("/api/auth/me") ||
          path.endsWith("/api/auth/logout");
        const isProxyEndpoint =
          path.startsWith("/api/harvest/") ||
          path.startsWith("/api/plantation/");
        if (isSessionEndpoint || isProxyEndpoint) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
