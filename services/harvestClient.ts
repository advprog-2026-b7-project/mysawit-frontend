import { createServiceClient } from "./createServiceClient";

const harvestClient = createServiceClient(
  process.env.NEXT_PUBLIC_HARVEST_API_URL || "http://localhost:8082"
);

export default harvestClient;
