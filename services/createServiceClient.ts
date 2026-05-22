import axios from "axios";
import type { AxiosInstance } from "axios";
import { getTokenCookie, setTokenCookie } from "./tokenCookie";

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
    const token = getTokenCookie();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const token = response.data?.token;
      if (typeof token === "string") {
        setTokenCookie(token);
      }
      return response;
    },
    (error) => {
      if (typeof window !== "undefined" && error?.response?.status === 401) {
        const rawUrl: string = error?.config?.url ?? "";
        const path = rawUrl.split("?")[0];
        const isSessionEndpoint =
          path.endsWith("/api/auth/me") ||
          path.endsWith("/api/auth/logout");
        const isProxyEndpoint =
          path.startsWith("/api/harvest/") ||
          path.startsWith("/api/plantation/") ||
          path.startsWith("/api/delivery/");
        if (isSessionEndpoint || isProxyEndpoint) {
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
