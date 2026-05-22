import AdminLayout from "@/components/layout/AdminLayout";
import HarvestDetailView from "@/features/harvest/components/HarvestDetailView";

export default async function HarvestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminLayout activePage="Plantation">
      <HarvestDetailView id={id} />
    </AdminLayout>
  );
}
