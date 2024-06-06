import Breadcrumb from "@/app/components/admin/breadcrumbs/Breadcrumb";
import NotificationsTable from "@/app/components/admin/tables/NotificationsTable";

export default async function page() {
  return (
    <div>
      <Breadcrumb pageName="Etudiants" />

      <NotificationsTable />
    </div>
  );
}
