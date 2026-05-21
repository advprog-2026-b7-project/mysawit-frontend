import AdminLayout from "@/components/layout/AdminLayout";
import PlantationList from "@/features/plantation/components/PlantationList";

export default function PlantationsPage() {
  return (
    <AdminLayout activePage="Plantation">
      <PlantationList />
    </AdminLayout>
  );
}
