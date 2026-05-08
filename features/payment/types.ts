export interface Payroll {
    id: string;
    workerId: string;
    amount: number;
    referenceId: string;
    status: string;
    rejectionReason?: string;
}