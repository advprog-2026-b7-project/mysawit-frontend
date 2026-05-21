// Payment Feature Routing Guide

export const PAYMENT_ROUTES = {
  // Admin Routes
  admin: {
    payment: '/admin/payment',
    paymentOverview: '/admin/payment?tab=overview',
    paymentList: '/admin/payment?tab=payroll',
    wageSettings: '/admin/payment?tab=settings',
    wallet: '/admin/payment?tab=wallet',
  },

  // Worker Routes
  worker: {
    payroll: '/payment/payroll',
    payrollStats: '/payment/payroll?tab=stats',
    payrollList: '/payment/payroll?tab=list',
  },

  // API Routes
  api: {
    // Payroll endpoints
    payroll: {
      list: '/api/payroll/list',
      byId: (id: string) => `/api/payroll/${id}`,
      workerPayrolls: '/api/payroll/worker',
      approve: (id: string) => `/api/payroll/${id}/approve`,
      reject: (id: string) => `/api/payroll/${id}/reject`,
      calculate: '/api/payroll/calculate',
    },

    // Wage variables endpoints
    wageVariables: {
      get: '/api/wage-variables',
      update: '/api/wage-variables',
    },

    // Wallet endpoints
    wallet: {
      get: '/api/wallet',
      byUserId: (userId: string) => `/api/wallet/user/${userId}`,
      balance: '/api/wallet/balance',
    },

    // Payment gateway endpoints
    payment: {
      topUp: '/api/payment/top-up',
      verify: (transactionId: string) => `/api/payment/verify/${transactionId}`,
      payout: (payrollId: string) => `/api/payment/payout/${payrollId}`,
    },

    // Test endpoints
    test: {
      triggerPayment: '/test/pay',
    },
  },
};

// Helper function to build API URL
export function buildApiUrl(endpoint: string, baseURL?: string): string {
  const base = baseURL || process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:8082/api';
  return `${base}${endpoint}`;
}

// Helper function to build payroll filter params
export interface PayrollFilterParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  workerId?: string;
  page?: number;
  pageSize?: number;
}

export function buildPayrollFilterUrl(params: PayrollFilterParams): string {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.workerId) searchParams.append('workerId', params.workerId);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
