import AdminLayout from "@/components/layout/AdminLayout";
import AdminDeliveryList from "@/features/delivery/components/AdminDeliveryList";

export default function AdminShipmentsPage() {
  return (
    <AdminLayout activePage="Shipments">
      <AdminDeliveryList />
    </AdminLayout>
  );
}
