import { createServiceClient } from "./createServiceClient";

const authClient = createServiceClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
);

export default authClient;