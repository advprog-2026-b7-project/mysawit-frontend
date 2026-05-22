import { createServiceClient } from "./createServiceClient";

const paymentClient = createServiceClient("/api/payment");

export default paymentClient;
