'use client';

import { useState, useCallback, useEffect } from 'react';
import PaymentClient from './api';
import {
  Payroll,
  PayrollListResponse,
  WageVariables,
  Wallet,
  PayrollFilters,
  PaymentGatewayResponse,
} from './types';

// Initialize payment client
const paymentClient = new PaymentClient(process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:8082/api');

/**
 * Hook for managing payment/payroll operations
 */
export function usePayment() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payrolls
  const fetchPayrolls = useCallback(async (filters?: PayrollFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentClient.getPayrolls(filters);
      setPayrolls(response.data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch payrolls';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single payroll
  const fetchPayrollById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const payroll = await paymentClient.getPayrollById(id);
      return payroll;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch payroll';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve payroll
  const approve = useCallback(async (payrollId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await paymentClient.approvePayroll(payrollId);
      setPayrolls((prev) => prev.map((p) => (p.id === payrollId ? updated : p)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve payroll';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject payroll
  const reject = useCallback(async (payrollId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await paymentClient.rejectPayroll(payrollId, reason);
      setPayrolls((prev) => prev.map((p) => (p.id === payrollId ? updated : p)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject payroll';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payrolls,
    loading,
    error,
    fetchPayrolls,
    fetchPayrollById,
    approve,
    reject,
  };
}

/**
 * Hook for managing wage variables
 */
export function useWageVariables() {
  const [variables, setVariables] = useState<WageVariables | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wage variables
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentClient.getWageVariables();
      setVariables(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch wage variables';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update wage variables
  const update = useCallback(async (newVariables: WageVariables) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await paymentClient.updateWageVariables(newVariables);
      setVariables(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update wage variables';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    variables,
    loading,
    error,
    fetch,
    update,
  };
}

/**
 * Hook for managing wallet
 */
export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentClient.getWallet();
      setWallet(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch wallet';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get balance
  const getBalance = useCallback(async () => {
    try {
      return await paymentClient.getWalletBalance();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get balance';
      setError(message);
      throw err;
    }
  }, []);

  return {
    wallet,
    loading,
    error,
    fetch,
    getBalance,
  };
}

/**
 * Hook for payment gateway operations
 */
export function usePaymentGateway() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initiate top-up
  const initiateTopUp = useCallback(async (amount: number, paymentMethod: 'XENDIT' | 'MOCK' = 'MOCK') => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentClient.initiateTopUp({ amount, paymentMethod });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate top-up';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (transactionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentClient.verifyPayment(transactionId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify payment';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    initiateTopUp,
    verifyPayment,
  };
}

/**
 * Hook for worker payroll operations
 */
export function useWorkerPayroll(workerId: string) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch worker payrolls
  const fetch = useCallback(
    async (filters?: PayrollFilters) => {
      setLoading(true);
      setError(null);
      try {
        const response = await paymentClient.getWorkerPayrolls(workerId, filters);
        setPayrolls(response.data);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch payrolls';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [workerId]
  );

  // Auto-fetch on mount and when workerId changes
  useEffect(() => {
    if (workerId) {
      fetch();
    }
  }, [workerId, fetch]);

  return {
    payrolls,
    loading,
    error,
    fetch,
  };
}
