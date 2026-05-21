import axios, { AxiosInstance } from 'axios';
import {
  Payroll,
  PayrollListResponse,
  WageVariables,
  Wallet,
  PayrollFilters,
  ApprovePayrollRequest,
  RejectPayrollRequest,
  TopUpRequest,
  PaymentGatewayResponse,
} from './types';

class PaymentClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8082/api') {
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

  // ========== PAYROLL ENDPOINTS ==========

  /**
   * Get all payrolls with optional filters
   */
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

  /**
   * Get payroll by ID
   */
  async getPayrollById(id: string): Promise<Payroll> {
    try {
      const response = await this.client.get(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll:', error);
      throw error;
    }
  }

  /**
   * Get payrolls for a specific worker
   */
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

  /**
   * Approve payroll (Admin only)
   */
  async approvePayroll(payrollId: string): Promise<Payroll> {
    try {
      const response = await this.client.post(`/payroll/${payrollId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving payroll:', error);
      throw error;
    }
  }

  /**
   * Reject payroll with reason (Admin only)
   */
  async rejectPayroll(payrollId: string, reason: string): Promise<Payroll> {
    try {
      const response = await this.client.post(`/payroll/${payrollId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting payroll:', error);
      throw error;
    }
  }

  // ========== WAGE VARIABLES ENDPOINTS ==========

  /**
   * Get current wage variables
   */
  async getWageVariables(): Promise<WageVariables> {
    try {
      const response = await this.client.get('/wage-variables');
      return response.data;
    } catch (error) {
      console.error('Error fetching wage variables:', error);
      throw error;
    }
  }

  /**
   * Update wage variables (Admin only)
   */
  async updateWageVariables(variables: WageVariables): Promise<WageVariables> {
    try {
      const response = await this.client.post('/wage-variables', variables);
      return response.data;
    } catch (error) {
      console.error('Error updating wage variables:', error);
      throw error;
    }
  }

  // ========== WALLET ENDPOINTS ==========

  /**
   * Get wallet info for current user
   */
  async getWallet(): Promise<Wallet> {
    try {
      const response = await this.client.get('/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: string): Promise<Wallet> {
    try {
      const response = await this.client.get(`/wallet/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<number> {
    try {
      const wallet = await this.getWallet();
      return wallet.balance;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  // ========== PAYMENT GATEWAY ENDPOINTS ==========

  /**
   * Initiate top-up using payment gateway
   */
  async initiateTopUp(request: TopUpRequest): Promise<PaymentGatewayResponse> {
    try {
      const response = await this.client.post('/payment/top-up', request);
      return response.data;
    } catch (error) {
      console.error('Error initiating top-up:', error);
      throw error;
    }
  }

  /**
   * Verify payment (callback from payment gateway)
   */
  async verifyPayment(transactionId: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await this.client.post(`/payment/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Process payout (transfer wallet balance to workers)
   */
  async processPayout(payrollId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post(`/payment/payout/${payrollId}`);
      return response.data;
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  // ========== PAYMENT CALCULATION ENDPOINTS ==========

  /**
   * Calculate payroll for a worker based on harvest/delivery data
   */
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

// Export singleton instance
export default PaymentClient;
