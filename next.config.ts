import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const authApiUrl =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:8080";
const deliveryApiUrl =
  process.env.NEXT_PUBLIC_DELIVERY_API_URL ?? "http://localhost:8082";
const paymentApiUrl =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ?? "http://localhost:8084";
const plantationApiUrl =
  process.env.NEXT_PUBLIC_PLANTATION_API_URL ?? "http://localhost:8081";
const harvestApiUrl =
  process.env.NEXT_PUBLIC_HARVEST_API_URL ?? "http://localhost:8083";

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
      {
        source: "/api/delivery/v1/:path*",
        destination: `${deliveryApiUrl}/api/v1/:path*`,
      },
      {
        source: "/api/payment/:path*",
        destination: `${paymentApiUrl}/api/payment/:path*`,
      },
      {
        source: "/api/payroll/:path*",
        destination: `${paymentApiUrl}/api/payroll/:path*`,
      },
      {
        source: "/api/plantation/:path*",
        destination: `${plantationApiUrl}/api/:path*`,
      },
      {
        source: "/api/harvest/:path*",
        destination: `${harvestApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
