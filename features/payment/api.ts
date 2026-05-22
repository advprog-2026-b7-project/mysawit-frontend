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

  constructor(baseURL: string = 'http://localhost:8084/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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

  async getPayrollById(id: string): Promise<Payroll> {
    try {
      const response = await this.client.get(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll:', error);
      throw error;
    }
  }

  async getWorkerPayrolls(workerId: string, filters?: PayrollFilters): Promise<PayrollListResponse> {
    try {
      const params = new URLSearchParams({
        workerId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
        ...(filters?.page && { page: filters.page.toString() }),
        ...(filters?.pageSize && { pageSize: filters.pageSize.toString() }),
      });

      const response = await this.client.get('/payroll/worker', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching worker payrolls:', error);
      throw error;
    }
  }

  async approvePayroll(payrollId: string): Promise<Payroll> {
    try {
      const response = await this.client.post(`/payroll/${payrollId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving payroll:', error);
      throw error;
    }
  }

  async rejectPayroll(payrollId: string, reason: string): Promise<Payroll> {
    try {
      const response = await this.client.post(`/payroll/${payrollId}/reject`, { reason });
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

  async calculatePayroll(
    workerId: string,
    workerType: 'BURUH' | 'SUPIR_TRUK' | 'MANDOR',
    weightKg: number
  ): Promise<{ grossAmount: number; netAmount: number; description: string }> {
    try {
      const response = await this.client.post('/payroll/calculate', {
        workerId,
        workerType,
        weightKg,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw error;
    }
  }
}

export default PaymentClient;
