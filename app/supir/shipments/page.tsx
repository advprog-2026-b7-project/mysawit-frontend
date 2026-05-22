import AdminLayout from "@/components/layout/AdminLayout";
import SupirShipmentList from "@/features/delivery/components/SupirShipmentList";

export default function SupirShipmentsPage() {
  return (
    <AdminLayout activePage="Assigned Shipments">
      <SupirShipmentList />
    </AdminLayout>
  );
}
