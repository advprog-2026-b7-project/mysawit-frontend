import { createServiceClient } from "./createServiceClient";

// Route all delivery requests through the Next.js server-side proxy
// at /api/delivery/[...path] so the HttpOnly access_token cookie can be
// read server-side and injected as Authorization: Bearer.
const deliveryClient = createServiceClient("/api/delivery");

export default deliveryClient;
