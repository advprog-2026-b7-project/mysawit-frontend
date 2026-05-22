export type ShipmentStatus =
  | "MEMUAT"
  | "MENGIRIM"
  | "TIBA_DI_TUJUAN"
  | "DISETUJUI_MANDOR"
  | "DITOLAK_MANDOR"
  | "DISETUJUI_ADMIN"
  | "DITOLAK_ADMIN"
  | "DISETUJUI_PARSIAL";

export interface ShipmentResponse {
  id: string;
  plantationId: string;
  mandorId: string;
  driverId?: string | null;
  totalWeightKg: number;
  recognizedWeightKg?: number | null;
  status: ShipmentStatus;
  rejectionReason?: string | null;
  harvestIds?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentPayload {
  harvestIds: string[];
  driverId: string;
}

export interface AdminRejectPayload {
  reason: string;
  isPartial: boolean;
  recognizedKg?: number;
}

export interface DriverItem {
  id: string;
  name?: string | null;
}
