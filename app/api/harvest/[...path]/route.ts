const HARVEST_BACKEND_URL =
  process.env.HARVEST_BACKEND ?? "http://localhost:8083";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function buildTargetUrl(baseUrl: string, path: string[], search: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const encodedPath = path.map(encodeURIComponent).join("/");
  return `${normalizedBase}/api/${encodedPath}${search}`;
}

function resolveAuthorization(request: Request) {
  const bearerToken = request.headers.get("authorization");
  if (bearerToken) return bearerToken;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/);
  const rawToken = tokenMatch?.[1]?.trim();
  return rawToken ? `Bearer ${decodeURIComponent(rawToken)}` : undefined;
}

async function proxyRequest(request: Request, context: RouteContext) {
  const { path = [] } = await context.params;
  const sourceUrl = new URL(request.url);
  const targetUrl = buildTargetUrl(HARVEST_BACKEND_URL, path, sourceUrl.search);
  const authorization = resolveAuthorization(request);

  if (!authorization) {
    return Response.json(
      { status: "error", message: "Missing access token" },
      { status: 401 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.toLowerCase().startsWith("multipart/form-data");

  const headers = new Headers();
  if (request.headers.has("accept")) {
    headers.set("accept", request.headers.get("accept")!);
  }
  if (!isMultipart && contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("authorization", authorization);

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    if (isMultipart) {
      const incoming = await request.formData();
      const outgoing = new FormData();
      for (const [key, value] of incoming.entries()) {
        outgoing.append(key, value);
      }
      init.body = outgoing;
    } else {
      init.body = request.body;
      init.duplex = "half";
    }
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
    console.error("[harvest-proxy] fetch failed:", err);
    return Response.json(
      {
        status: "error",
        message: `Harvest service is unreachable at ${HARVEST_BACKEND_URL}`,
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
