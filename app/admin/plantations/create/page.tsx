import AdminLayout from "@/components/layout/AdminLayout";
import PlantationCreateForm from "@/features/plantation/components/PlantationCreateForm";

export default function CreatePlantationPage() {
  return (
    <AdminLayout activePage="Plantation">
      <PlantationCreateForm />
    </AdminLayout>
  );
}
