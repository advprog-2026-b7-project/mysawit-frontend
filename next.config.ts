import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const authApiUrl =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:8080";
const paymentApiUrl =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ?? "http://localhost:8084";

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
      // /api/delivery, /api/plantation and /api/harvest are NOT rewritten here:
      // they are handled by app/api/*/[...path]/route.ts, which turn the
      // HttpOnly access_token cookie into an Authorization header. Rewrites
      // run before dynamic routes, so a rewrite here would bypass them.
      {
        source: "/api/payment/:path*",
        destination: `${paymentApiUrl}/api/payment/:path*`,
      },
      {
        source: "/api/payroll/:path*",
        destination: `${paymentApiUrl}/api/payroll/:path*`,
      },
    ];
  },
};

export default nextConfig;
