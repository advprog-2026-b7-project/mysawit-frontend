import { createServiceClient } from "./createServiceClient";

const plantationClient = createServiceClient(
  process.env.NEXT_PUBLIC_PLANTATION_API_URL || "/api/plantation"
);

export default plantationClient;
