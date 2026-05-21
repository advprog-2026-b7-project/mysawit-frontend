import AdminLayout from "@/components/layout/AdminLayout";
import PlantationDetailView from "@/features/plantation/components/PlantationDetailView";

export default async function PlantationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout activePage="Plantation">
      <PlantationDetailView id={id} />
    </AdminLayout>
  );
}
