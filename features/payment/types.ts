// Payroll Status
export type PayrollStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED';

// Payroll Interface
export interface Payroll {
  id: string;
  workerId: string;
  workerName?: string;
  amount: number;
  status: PayrollStatus;
  referenceId: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}

// Payment Request/Response
export interface CreatePaymentRequest {
  workerId: string;
  amount: number;
  referenceId: string;
}

export interface ApprovePayrollRequest {
  payrollId: string;
}

export interface RejectPayrollRequest {
  payrollId: string;
  reason: string;
}

// Wage Variables (Upah per KG)
export interface WageVariables {
  id?: string;
  upahBuruhPerKg: number;
  upahSupirPerKg: number;
  upahMandorPerKg: number;
  createdAt?: string;
  updatedAt?: string;
}

// Wallet for Admin
export interface Wallet {
  id: string;
  userId: string;
  balance: number; // In SawitDollar
  balanceInRupiah?: number; // balance * 10,000
  createdAt?: string;
  updatedAt?: string;
}

// Payment Gateway Request
export interface TopUpRequest {
  amount: number; // In SawitDollar
  paymentMethod: 'XENDIT' | 'MOCK';
}

// Payment Gateway Response
export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  redirectUrl?: string;
}

// Payroll Filters
export interface PayrollFilters {
  status?: PayrollStatus;
  startDate?: string;
  endDate?: string;
  workerId?: string;
  page?: number;
  pageSize?: number;
}

// Payroll List Response with Pagination
export interface PayrollListResponse {
  data: Payroll[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Payroll Calculation Data
export interface PayrollCalculation {
  harvestedWeightKg: number;
  deliveredWeightKg: number;
  recognizedWeightKg: number;
  wageVariables: WageVariables;
  buruhPaymentPercentage: number; // Default 90%
  supirPaymentPercentage: number; // Default 90%
  mandorPaymentPercentage: number; // Default 90%
}

// Payment calculation result
export interface PaymentCalculationResult {
  workerId: string;
  workerType: 'BURUH' | 'SUPIR_TRUK' | 'MANDOR';
  grossAmount: number;
  netAmount: number; // After percentage deduction
  breakdown: {
    wagePerKg: number;
    weightKg: number;
    percentage: number;
    formula: string;
  };
  description: string;
}
