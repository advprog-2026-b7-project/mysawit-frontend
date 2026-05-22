import { createServiceClient } from "./createServiceClient";

const payrollClient = createServiceClient("/api/payroll");

export default payrollClient;
