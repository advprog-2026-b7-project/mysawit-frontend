import { createServiceClient } from "./createServiceClient";

const paymentClient = createServiceClient(
  process.env.NEXT_PUBLIC_PAYMENT_API_URL || "/api"
);

export default paymentClient;
