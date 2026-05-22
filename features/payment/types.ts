export interface Payroll {
    id: string;
    workerId: string;
    workerName?: string;
    amount: number;
    referenceId: string;
    status: string; // PENDING | ACCEPTED | REJECTED
    rejectionReason?: string;
    payrollType?: string; // HARVEST | DELIVERY
    description?: string;
    tanggal?: string;
    createdAt?: string;
    approvedAt?: string;
}

export interface Wallet {
    userId: string;
    balance: number;
    currency: string;
}

export interface WageSettings {
    id: number;
    buruhWagePerKg: number;
    supirTruckWagePerKg: number;
    mandorWagePerKg: number;
}