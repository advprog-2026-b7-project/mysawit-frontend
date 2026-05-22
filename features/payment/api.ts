import axios, { AxiosInstance } from 'axios';
import {
  Payroll,
  PayrollListResponse,
  WageVariables,
  PayrollFilters,
  ApprovePayrollRequest,
  RejectPayrollRequest,
} from './types';

class PaymentClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_PAYMENT_API_URL || '/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined' && this.baseURL.startsWith('/')) {
        const cookie = document.cookie;
        if (cookie) {
          config.headers.Cookie = cookie;
        }
      }
      return config;
    });
  }

  async getPayrolls(filters?: PayrollFilters): Promise<PayrollListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.workerId) params.append('workerId', filters.workerId);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      }

      const response = await this.client.get('/payroll/list', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      throw error;
    }
  }

  async getPayrollsByType(payrollType: string): Promise<PayrollListResponse> {
    try {
      const response = await this.client.get(`/payroll/by-type/${payrollType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payrolls by type:', error);
      throw error;
    }
  }

  async getPayrollById(id: string): Promise<Payroll> {
    try {
      const response = await this.client.get(`/payroll/${id}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll:', error);
      throw error;
    }
  }

  async getWorkerPayrolls(workerId: string, filters?: PayrollFilters): Promise<PayrollListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('workerId', workerId);
      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      }

      const response = await this.client.get('/payroll/worker', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching worker payrolls:', error);
      throw error;
    }
  }

  async approvePayroll(payrollId: string): Promise<Payroll> {
    try {
      const response = await this.client.patch(`/payroll/${payrollId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving payroll:', error);
      throw error;
    }
  }

  async rejectPayroll(payrollId: string, reason: string): Promise<Payroll> {
    try {
      const response = await this.client.patch(`/payroll/${payrollId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting payroll:', error);
      throw error;
    }
  }


  async getWageVariables(): Promise<WageVariables> {
    try {
      const response = await this.client.get('/wage-variables');
      return response.data;
    } catch (error) {
      console.error('Error fetching wage variables:', error);
      throw error;
    }
  }

  async updateWageVariables(variables: WageVariables): Promise<WageVariables> {
    try {
      const response = await this.client.post('/wage-variables', variables);
      return response.data;
    } catch (error) {
      console.error('Error updating wage variables:', error);
      throw error;
    }
  }

  async createHarvestPayroll(payload: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await this.client.post('/payroll/harvest/create', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating harvest payroll:', error);
      throw error;
    }
  }

  async createDeliveryPayroll(payload: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await this.client.post('/payroll/delivery/create', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery payroll:', error);
      throw error;
    }
  }
}

export default PaymentClient;
