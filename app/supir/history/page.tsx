import AdminLayout from "@/components/layout/AdminLayout";
import SupirHistoryList from "@/features/delivery/components/SupirHistoryList";

export default function SupirHistoryPage() {
  return (
    <AdminLayout activePage="Delivery History">
      <SupirHistoryList />
    </AdminLayout>
  );
}
