import { createServiceClient } from "./createServiceClient";

const paymentClient = createServiceClient(
  process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:8084"
);

export default paymentClient;
