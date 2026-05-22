/**
 * Tests for the 401 redirect behaviour in createServiceClient.
 *
 * Rules under test:
 *  - A 401 from /api/auth/me     → redirect window.location.href to /login
 *  - A 401 from /api/auth/logout → redirect to /login
 *  - A 401 from /api/plantation/... → no redirect (caller handles fallback)
 *  - A 401 from /api/harvest/...   → no redirect
 *  - A 401 from /api/auth/login    → no redirect (login form shows error)
 *  - A 401 from /api/admin/users   → no redirect (page shows error state)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { createServiceClient } from "../createServiceClient";

// Stub window so the browser-guard `typeof window !== 'undefined'` passes
// and we can assert on location.href without a real DOM.
const mockLocation = { href: "" };
vi.stubGlobal("window", { location: mockLocation });

/**
 * Returns an Axios adapter that simulates an HTTP 401 response.
 *
 * Axios custom adapters bypass the internal settle() helper that real adapters
 * (xhr / http) use to convert non-2xx status codes into rejected promises.
 * To trigger the response-error interceptor we must replicate that logic:
 * check validateStatus ourselves and throw an AxiosError when it fails.
 */
function always401Adapter() {
  return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const response: AxiosResponse = {
      data: { message: "Unauthorized" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
      request: null,
    };

    const validateStatus = config.validateStatus;
    if (!validateStatus || !validateStatus(401)) {
      // Reject exactly as Axios's settle() would — the interceptor error
      // handler receives this and can inspect error.response.status and
      // error.config.url.
      return Promise.reject(
        new axios.AxiosError(
          "Request failed with status code 401",
          "ERR_BAD_RESPONSE",
          config,
          null,
          response,
        ),
      );
    }
    return response;
  };
}

describe("createServiceClient – 401 redirect behaviour", () => {
  beforeEach(() => {
    mockLocation.href = "";
  });

  // ── should redirect ─────────────────────────────────────────────────────

  it("redirects to /login when /api/auth/me returns 401", async () => {
    const client = createServiceClient("");
    client.defaults.adapter = always401Adapter();

    await expect(client.get("/api/auth/me")).rejects.toBeDefined();
    expect(mockLocation.href).toBe("/login");
  });

  it("redirects to /login when /api/auth/logout returns 401", async () => {
    const client = createServiceClient("");
    client.defaults.adapter = always401Adapter();

    await expect(client.post("/api/auth/logout", {})).rejects.toBeDefined();
    expect(mockLocation.href).toBe("/login");
  });

  // ── should NOT redirect ─────────────────────────────────────────────────

  it("does NOT redirect when createServiceClient('/api/plantation') gets a 401", async () => {
    const client = createServiceClient("/api/plantation");
    client.defaults.adapter = always401Adapter();

    await expect(client.get("/api/v1/plantations")).rejects.toBeDefined();
    // config.url = "/api/v1/plantations" (baseURL not yet folded in at interceptor
    // layer) — does not match a session endpoint.
    expect(mockLocation.href).toBe("");
  });

  it("does NOT redirect when /api/harvest/... returns 401", async () => {
    const client = createServiceClient("/api/harvest");
    client.defaults.adapter = always401Adapter();

    await expect(client.get("/api/v1/harvests")).rejects.toBeDefined();
    expect(mockLocation.href).toBe("");
  });

  it("does NOT redirect when /api/auth/login returns 401 (wrong credentials)", async () => {
    const client = createServiceClient("");
    client.defaults.adapter = always401Adapter();

    await expect(client.post("/api/auth/login", {})).rejects.toBeDefined();
    expect(mockLocation.href).toBe("");
  });

  it("does NOT redirect when /api/admin/users returns 401", async () => {
    const client = createServiceClient("");
    client.defaults.adapter = always401Adapter();

    await expect(client.get("/api/admin/users")).rejects.toBeDefined();
    expect(mockLocation.href).toBe("");
  });
});
