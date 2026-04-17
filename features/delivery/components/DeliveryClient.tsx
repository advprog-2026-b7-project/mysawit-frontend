"use client";

import { useState } from "react";
import ShipmentForm from "@/features/delivery/components/ShipmentForm";
import ShipmentStatusButton from "@/features/delivery/components/ShipmentStatusButton";
import type { Shipment } from "@/features/delivery/types";

export default function DeliveryClient() {
    const [shipment, setShipment] = useState<Shipment | null>(null);

    return (
        <div>
            <ShipmentForm onSuccess={(shipment) => setShipment(shipment)} />

            {shipment && (
                <div style={{ marginTop: "20px" }}>
                    <p>Shipment ID: <strong>{shipment.id}</strong></p>
                    <p>Status saat ini: <strong>{shipment.status}</strong></p>
                    <ShipmentStatusButton
                        shipment={shipment}
                        onStatusUpdated={(updated) => setShipment(updated)}
                    />
                </div>
            )}
        </div>
    );
}