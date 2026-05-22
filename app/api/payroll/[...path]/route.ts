const PAYMENT_BACKEND_URL =
   process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:8084"

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function buildTargetUrl(baseUrl: string, path: string[], search: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const encodedPath = path.map(encodeURIComponent).join("/");
  return `${normalizedBase}/${encodedPath}${search}`;
}

async function proxyRequest(request: Request, context: RouteContext) {
  const { path = [] } = await context.params;
  const sourceUrl = new URL(request.url);
  const targetUrl = buildTargetUrl(PAYMENT_BACKEND_URL, path, sourceUrl.search);

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
  const isMultipart = contentType.toLowerCase().startsWith("multipart/form-data");

  const headers = new Headers();
  if (request.headers.has("accept")) {
    headers.set("accept", request.headers.get("accept")!);
  }
  if (!isMultipart && contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("authorization", `Bearer ${accessToken}`);

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
  } catch {
    return Response.json(
      {
        status: "error",
        message: `Payment service is unreachable at ${PAYMENT_BACKEND_URL}`,
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