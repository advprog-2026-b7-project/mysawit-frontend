import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const authApiUrl =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${authApiUrl}/api/auth/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${authApiUrl}/api/admin/:path*`,
      },
      {
        source: "/api/assignments/:path*",
        destination: `${authApiUrl}/api/assignments/:path*`,
      },
    ];
  },
};

export default nextConfig;
