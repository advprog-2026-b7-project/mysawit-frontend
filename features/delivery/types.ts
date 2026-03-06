export interface Shipment {
    id: string;
    plantationId: string;
    mandorId: string;
    driverId?: string; // Tanda tanya karena bisa null
    totalWeightKg: number;
    status: 'MEMUAT' | 'DALAM_PERJALANAN' | 'SELESAI' | 'DITOLAK';
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