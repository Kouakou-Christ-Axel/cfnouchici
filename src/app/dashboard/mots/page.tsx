import { MotsTable } from "@/components/admin/mots-table";
import { getSessionOrRedirect } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function DashboardMotsPage() {
  await getSessionOrRedirect("/dashboard/mots", "MODERATEUR");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Tous les mots
        </h1>
        <p className="text-muted-foreground text-sm">
          Parcours, filtre et gère l&apos;ensemble du dictionnaire.
        </p>
      </header>
      <MotsTable />
    </div>
  );
}
