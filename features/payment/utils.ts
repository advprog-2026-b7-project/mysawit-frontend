// Payment Calculation Utilities

import { WageVariables, PaymentCalculationResult } from './types';


export function calculateBuruhPayment(
  wagePerKg: number,
  weightKg: number,
  percentage: number = 0.9
): number {
  return Math.floor((wagePerKg / 1000) * weightKg * percentage);
}


export function calculateSupirPayment(
  wagePerKg: number,
  weightKg: number,
  percentage: number = 0.9
): number {
  return Math.floor((wagePerKg / 1000) * weightKg * percentage);
}

export function calculateMandorPayment(
  wagePerKg: number,
  weightKg: number,
  percentage: number = 0.9
): number {
  return Math.floor((wagePerKg / 1000) * weightKg * percentage);
}

export function generatePaymentCalculation(
  workerId: string,
  workerType: 'BURUH' | 'SUPIR_TRUK' | 'MANDOR',
  wagePerKg: number,
  weightKg: number,
  percentage: number = 0.9
): PaymentCalculationResult {
  let grossAmount = (wagePerKg / 1000) * weightKg;
  let netAmount = Math.floor(grossAmount * percentage);

  const typeLabel = {
    BURUH: 'Buruh',
    SUPIR_TRUK: 'Supir Truk',
    MANDOR: 'Mandor',
  };

  const formula = {
    BURUH: `Upah Buruh / Kg × Kilogram Sawit yang dipanen × 90%`,
    SUPIR_TRUK: `Upah Supir / Kg × Kilogram Sawit yang dikirim × 90%`,
    MANDOR: `Upah Mandor / Kg × Kilogram Sawit yang diakui pabrik × 90%`,
  };

  const description = `${typeLabel[workerType]}: (${wagePerKg.toLocaleString('id-ID')} / 1000 Kg) × ${weightKg.toLocaleString('id-ID')} Kg × 90% = ${netAmount.toLocaleString('id-ID')}`;

  return {
    workerId,
    workerType,
    grossAmount,
    netAmount,
    breakdown: {
      wagePerKg,
      weightKg,
      percentage,
      formula: formula[workerType],
    },
    description,
  };
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatSawitDollar(value: number): string {
  return `${value} $`;
}

export function sawaitDollarToRupiah(value: number): number {
  const conversionRate = parseInt(process.env.NEXT_PUBLIC_SAWIT_DOLLAR_TO_RUPIAH || '10000');
  return value * conversionRate;
}

export function rupiahToSawaitDollar(value: number): number {
  const conversionRate = parseInt(process.env.NEXT_PUBLIC_SAWIT_DOLLAR_TO_RUPIAH || '10000');
  return Math.floor(value / conversionRate);
}

export function getStatusColor(
  status: string
): {
  bg: string;
  text: string;
  badge: string;
} {
  const statusColors: Record<
    string,
    { bg: string; text: string; badge: string }
  > = {
    PENDING: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    APPROVED: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
    },
    REJECTED: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
    },
    SUCCESS: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
    },
    FAILED: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
    },
  };
  return statusColors[status] || { bg: 'bg-gray-50', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-800' };
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu Persetujuan',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    SUCCESS: 'Berhasil',
    FAILED: 'Gagal',
  };
  return labels[status] || status;
}

export function getWorkerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BURUH: 'Buruh',
    SUPIR_TRUK: 'Supir Truk',
    MANDOR: 'Mandor',
  };
  return labels[type] || type;
}

export function validateWageVariables(variables: {
  upahBuruhPerKg: number;
  upahSupirPerKg: number;
  upahMandorPerKg: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!variables.upahBuruhPerKg || variables.upahBuruhPerKg <= 0) {
    errors.push('Upah Buruh per Kg harus lebih dari 0');
  }
  if (!variables.upahSupirPerKg || variables.upahSupirPerKg <= 0) {
    errors.push('Upah Supir per Kg harus lebih dari 0');
  }
  if (!variables.upahMandorPerKg || variables.upahMandorPerKg <= 0) {
    errors.push('Upah Mandor per Kg harus lebih dari 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateRejectionReason(reason: string): { valid: boolean; error?: string } {
  if (!reason || reason.trim().length === 0) {
    return { valid: false, error: 'Alasan penolakan tidak boleh kosong' };
  }
  if (reason.length < 10) {
    return { valid: false, error: 'Alasan penolakan minimal 10 karakter' };
  }
  if (reason.length > 500) {
    return { valid: false, error: 'Alasan penolakan maksimal 500 karakter' };
  }
  return { valid: true };
}
