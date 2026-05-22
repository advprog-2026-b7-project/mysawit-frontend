/**
 * Server-side proxy for mysawit-delivery.
 *
 * Reads the HttpOnly access_token cookie and injects it as
 * Authorization: Bearer <token> so the delivery backend's JwtFilter
 * can authenticate the request.
 *
 * Frontend calls: /api/delivery/v1/deliveries/...
 * Proxied to:     DELIVERY_API_URL/api/v1/deliveries/...
 */

const DELIVERY_BACKEND_URL =
  process.env.DELIVERY_API_URL || "http://localhost:8082";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function buildTargetUrl(baseUrl: string, path: string[], search: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const encodedPath = path.map(encodeURIComponent).join("/");
  return `${normalizedBase}/api/${encodedPath}${search}`;
}

async function proxyRequest(request: Request, context: RouteContext) {
  const { path = [] } = await context.params;
  const sourceUrl = new URL(request.url);
  const targetUrl = buildTargetUrl(DELIVERY_BACKEND_URL, path, sourceUrl.search);

  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/);
  const rawToken = tokenMatch?.[1]?.trim();
  const accessToken = rawToken ? decodeURIComponent(rawToken) : undefined;

  if (!accessToken) {
    return Response.json(
      { status: "error", message: "No access_token cookie — not authenticated" },
      { status: 401 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  const headers = new Headers();
  if (request.headers.has("accept")) {
    headers.set("accept", request.headers.get("accept")!);
  }
  if (contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("authorization", `Bearer ${accessToken}`);

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[delivery-proxy] fetch failed:", err);
    return Response.json(
      {
        status: "error",
        message: `Delivery service is unreachable at ${DELIVERY_BACKEND_URL}`,
      },
      { status: 502 }
    );
  }
}

export function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}
