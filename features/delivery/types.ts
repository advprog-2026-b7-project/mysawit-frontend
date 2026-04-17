export interface Shipment {
    id: string;
    plantationId: string;
    mandorId: string;
    driverId?: string; // Tanda tanya karena bisa null
    totalWeightKg: number;
    status: 'MEMUAT' | 'MENGIRIM' | 'TIBA_DI_TUJUAN' | 'DISETUJUI_PARSIAL' |
        'DISETUJUI_MANDOR' | 'DITOLAK_MANDOR' | 'DISETUJUI_ADMIN' | 'DITOLAK_ADMIN';
    rejectedReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateShipmentRequest {
    plantationId: string;
    mandorId: string;
    totalWeightKg: number;
}

export interface AssignDriverRequest {
    driverId: string;
}