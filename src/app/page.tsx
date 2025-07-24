import { userWithToken } from "./actions/auth";
import { DataTableView } from "@/components/data-table-view";
import IntegrationsSidebar from "@/components/integrations-sidebar";

export default async function Home() {
  const session = await userWithToken();

  return (
    <main className="w-dvw flex min-h-screen pt-28 px-3 sm:items-start">
      <IntegrationsSidebar session={session} />
      <DataTableView session={session} />
    </main>
  );
}
