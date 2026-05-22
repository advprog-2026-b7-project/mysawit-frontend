import AdminLayout from "@/components/layout/AdminLayout";
import MandorShipmentList from "@/features/delivery/components/MandorShipmentList";

export default function MandorShipmentsPage() {
  return (
    <AdminLayout activePage="Shipments">
      <MandorShipmentList />
    </AdminLayout>
  );
}
