'use client';

import { useState, useCallback, useEffect } from 'react';
import PaymentClient from './api';
import {
  Payroll,
  PayrollListResponse,
  WageVariables,
  PayrollFilters,
} from './types';

const paymentClient = new PaymentClient(
   process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:8084"
);


export function usePayment() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

export function useWageVariables() {
  const [variables, setVariables] = useState<WageVariables | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

export function useWorkerPayroll(workerId: string) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
