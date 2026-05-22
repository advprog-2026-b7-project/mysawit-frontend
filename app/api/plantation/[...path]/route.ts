const PLANTATION_BACKEND_URL =
  process.env.PLANTATION_API_URL ||
  process.env.NEXT_PUBLIC_PLANTATION_API_URL ||
  "http://localhost:8081";

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
  const targetUrl = buildTargetUrl(PLANTATION_BACKEND_URL, path, sourceUrl.search);
  const authorization = resolveAuthorization(request);

  if (!authorization) {
    return Response.json(
      { status: "error", message: "Missing access token" },
      { status: 401 }
    );
  }

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (["accept", "content-type"].includes(lowerKey)) {
      headers.set(key, value);
    }
  }
  headers.set("authorization", authorization);

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
  } catch {
    return Response.json(
      {
        status: "error",
        message: "Plantation service is unreachable",
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

export function PUT(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}
