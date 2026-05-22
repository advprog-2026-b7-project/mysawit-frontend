import type {
  ShipmentResponse as SR,
  CreateShipmentPayload as CSP,
  ShipmentStatus as SS,
} from "./deliveryTypes";

export type ShipmentStatus = SS;
export type Shipment = SR;
export type CreateShipmentRequest = CSP;

export interface AssignDriverRequest {
  driverId: string;
}