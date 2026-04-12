import { getSessionOrRedirect } from "@/lib/auth-guard";
import { getAdminStats } from "@/lib/queries/admin";
import { db } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopContributors } from "@/components/dashboard/stats/top-contributors";
import { TopModerators } from "@/components/dashboard/stats/top-moderators";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  await getSessionOrRedirect("/dashboard/stats", "MODERATEUR");

  const stats = await getAdminStats();

  const topContributorsRaw = await db.user.findMany({
    where: { motsSoumis: { some: { statut: "VALIDE" } } },
    take: 20,
    include: { motsSoumis: { where: { statut: "VALIDE" }, select: { id: true } } },
  });

  const topContributors = topContributorsRaw
    .map((u) => ({ id: u.id, name: u.name, validatedCount: u.motsSoumis.length }))
    .sort((a, b) => b.validatedCount - a.validatedCount)
    .slice(0, 10);

  const topModerators = Object.values(stats.parModerateur)
    .map((m, i) => ({ id: `mod-${i}`, name: m.name, count: m.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Stats globales
        </h1>
        <p className="text-muted-foreground text-sm">
          Vue d&apos;ensemble de l&apos;activité du dictionnaire.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.totalContributions} />
        <StatCard label="Validés" value={stats.parStatut.VALIDE} tone="success" />
        <StatCard label="En attente" value={stats.parStatut.EN_ATTENTE} tone="warning" />
        <StatCard label="Rejetés" value={stats.parStatut.REJETE} tone="danger" />
        <StatCard label="Modérateurs actifs" value={stats.moderateursActifs} helper="cette semaine" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopContributors contributors={topContributors} />
        <TopModerators moderators={topModerators} />
      </div>
    </div>
  );
}
