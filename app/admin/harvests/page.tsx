import AdminLayout from "@/components/layout/AdminLayout";
import HarvestList from "@/features/harvest/components/HarvestList";

export default function HarvestsPage() {
  return (
    <AdminLayout activePage="Plantation">
      <HarvestList />
    </AdminLayout>
  );
}
