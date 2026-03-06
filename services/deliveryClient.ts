import { createServiceClient } from "./createServiceClient";

const deliveryClient = createServiceClient(
  process.env.NEXT_PUBLIC_DELIVERY_API_URL || "http://localhost:8083"
);

export default deliveryClient;
