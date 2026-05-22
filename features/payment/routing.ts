// Payment Feature Routing Guide

export const PAYMENT_ROUTES = {
  admin: {
    payment: '/admin/payment',
    paymentOverview: '/admin/payment?tab=overview',
    paymentList: '/admin/payment?tab=payroll',
    wageSettings: '/admin/payment?tab=settings',
  },

  buruh: {
    payroll: '/buruh/payroll',
    payrollStats: '/buruh/payroll?tab=stats',
    payrollList: '/buruh/payroll?tab=list',
  },

  mandor: {
    payroll: '/mandor/payroll',
    payrollOverview: '/mandor/payroll?tab=overview',
    teamPayroll: '/mandor/payroll?tab=team',
  },

  supir: {
    payroll: '/supir/payroll',
    payrollStats: '/supir/payroll?tab=stats',
    payrollList: '/supir/payroll?tab=list',
  },


  worker: {
    payroll: '/payment/payroll',
    payrollStats: '/payment/payroll?tab=stats',
    payrollList: '/payment/payroll?tab=list',
  },

  api: {
    payroll: {
      list: '/api/payroll/list',
      byType: (payrollType: string) => `/api/payroll/by-type/${payrollType}`,
      byWorker: (workerId: string) => `/api/payroll/worker?workerId=${encodeURIComponent(workerId)}`,
      byId: (id: string) => `/api/payroll/${id}`,
      status: (id: string) => `/api/payroll/${id}/status`,
      approve: (id: string) => `/api/payroll/${id}/approve`,
      reject: (id: string) => `/api/payroll/${id}/reject`,
      createHarvest: '/api/payroll/harvest/create',
      createDelivery: '/api/payroll/delivery/create',
    },

    wageVariables: {
      get: '/api/wage-variables',
      update: '/api/wage-variables',
    },

  },
};

export function buildApiUrl(endpoint: string, baseURL?: string): string {
  const base = baseURL || process.env.NEXT_PUBLIC_PAYMENT_API_URL || '/api';
  return `${base}${endpoint}`;
}

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
