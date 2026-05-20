import { createServiceClient } from "./createServiceClient";

const harvestClient = createServiceClient(
  process.env.NEXT_PUBLIC_HARVEST_API_URL || "/api/harvest"
);

export default harvestClient;
