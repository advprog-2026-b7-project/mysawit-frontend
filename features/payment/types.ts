export interface Payroll {
    id: string;
    workerId: string;
    amount: number;
    status: string;
    referenceId: string;
    rejectionReason?: string;
}