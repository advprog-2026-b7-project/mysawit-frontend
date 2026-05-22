const PAYMENT_BACKEND_URL =
  process.env.PAYMENT_API_URL ||
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ||
  "http://localhost:8084/api";

async function proxyRequest(request: Request) {
  const sourceUrl = new URL(request.url);
  const targetUrl = `${PAYMENT_BACKEND_URL.replace(/\/$/, "")}/wage-variables${sourceUrl.search}`;

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

export function GET(request: Request) {
  return proxyRequest(request);
}

export function POST(request: Request) {
  return proxyRequest(request);
}