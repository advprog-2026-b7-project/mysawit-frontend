import { deliveryApiClient } from "@/features/delivery/deliveryApi";
import type { CreateShipmentPayload, ShipmentResponse } from "@/features/delivery/deliveryTypes";

export const deliveryApi = {
  createShipment: async (data: CreateShipmentPayload): Promise<ShipmentResponse> => {
    return deliveryApiClient.createShipment(data);
  },

  assignDriver: async (id: string, driverId: string): Promise<ShipmentResponse> => {
    void driverId;
    return deliveryApiClient.updateStatus(id, "MEMUAT");
  },
};
