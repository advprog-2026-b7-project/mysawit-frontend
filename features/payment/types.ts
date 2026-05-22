export interface WageSettings {
  id: string;
  harvestPricePerKg: number;
  deliveryPricePerKg: number;
  mandorFeePercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollResponse {
  id: string;
  workerId: string;
  workerName: string;
  referenceId: string;
  payrollType: "HARVEST" | "DELIVERY";
  amount: number;
  mandorId: string;
  mandorAmount: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "ACCEPTED" | "REJECTED";
  note?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PayrollListResponse {
  payrolls: PayrollResponse[];
  total: number;
  page: number;
  size: number;
}

export interface CreatePayrollRequest {
  workerId: string;
  referenceId: string;
  amount: number;
  mandorId: string;
  mandorAmount?: number;
  note?: string;
}

export interface ApiSuccessResponse<T> {
  status: string;
  data: T;
}

export type PayrollType = "HARVEST" | "DELIVERY";
