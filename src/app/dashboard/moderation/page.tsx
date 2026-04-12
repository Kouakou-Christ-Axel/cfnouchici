import { getSessionOrRedirect } from "@/lib/auth-guard";
import { listAllMots, getAdminStats } from "@/lib/queries/admin";
import { StatCard } from "@/components/dashboard/stat-card";
import { PendingList } from "@/components/dashboard/moderation/pending-list";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  await getSessionOrRedirect("/dashboard/moderation", "MODERATEUR");

  const [stats, { data: pendingMots }] = await Promise.all([
    getAdminStats(),
    listAllMots({ statut: "EN_ATTENTE", sort: "popularity", limit: 50 }),
  ]);

  const validatedThisWeek = stats.actionsThisWeek;
  const acceptanceRate =
    stats.parStatut.VALIDE + stats.parStatut.REJETE > 0
      ? Math.round((stats.parStatut.VALIDE / (stats.parStatut.VALIDE + stats.parStatut.REJETE)) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          File de modération
        </h1>
        <p className="text-muted-foreground text-sm">
          {stats.parStatut.EN_ATTENTE} mot{stats.parStatut.EN_ATTENTE > 1 ? "s" : ""} en attente, triés par popularité.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="En attente" value={stats.parStatut.EN_ATTENTE} tone="warning" />
        <StatCard label="Validés" value={stats.parStatut.VALIDE} tone="success" />
        <StatCard label="Rejetés" value={stats.parStatut.REJETE} tone="danger" />
        <StatCard label="Taux d'acceptation" value={`${acceptanceRate}%`} helper={`${validatedThisWeek} actions cette semaine`} />
      </div>

      <PendingList mots={pendingMots as never} />
    </div>
  );
}
