import { createServiceClient } from "./createServiceClient";

const plantationClient = createServiceClient(
  process.env.NEXT_PUBLIC_PLANTATION_API_URL || "http://localhost:8081"
);

export default plantationClient;
