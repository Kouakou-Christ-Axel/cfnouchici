import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { OverviewPropsList } from "@/components/dashboard/overview/overview-props-list";

interface UserOverviewProps {
  name: string;
  stats: {
    total: number;
    validated: number;
    pending: number;
    rejected: number;
    oldestPendingAt: Date | null;
    recentPropositions: {
      id: string;
      slug: string;
      mot: string;
      definition: string;
      statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
    }[];
  };
}

export function UserOverview({ name, stats }: UserOverviewProps) {
  const acceptanceRate =
    stats.validated + stats.rejected > 0
      ? Math.round((stats.validated / (stats.validated + stats.rejected)) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Bonjour {name} 👋
        </h1>
        <p className="text-muted-foreground text-sm">Voici un aperçu de ton activité sur nouchi.ci.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Propositions" value={stats.total} />
        <StatCard
          label="Validées"
          value={stats.validated}
          helper={stats.validated + stats.rejected > 0 ? `${acceptanceRate}% de réussite` : undefined}
          tone="success"
        />
        <StatCard
          label="En attente"
          value={stats.pending}
          helper={stats.oldestPendingAt ? `depuis ${new Date(stats.oldestPendingAt).toLocaleDateString("fr-FR")}` : undefined}
          tone="warning"
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-(family-name:--font-heading) text-lg font-bold tracking-tight">Dernières propositions</h2>
          <Link href="/dashboard/propositions" className="text-sm text-muted-foreground hover:text-foreground">Voir tout →</Link>
        </div>
        <OverviewPropsList propositions={stats.recentPropositions} />
      </section>
    </div>
  );
}
