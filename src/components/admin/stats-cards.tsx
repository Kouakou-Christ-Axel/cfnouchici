import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    parStatut: { EN_ATTENTE: number; VALIDE: number; REJETE: number };
    totalContributions: number;
    moderateursActifs: number;
    actionsThisWeek: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "En attente",
      value: stats.parStatut.EN_ATTENTE,
      className: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Validés",
      value: stats.parStatut.VALIDE,
      className: "text-green-600 dark:text-green-400",
    },
    {
      label: "Rejetés",
      value: stats.parStatut.REJETE,
      className: "text-red-600 dark:text-red-400",
    },
    {
      label: "Total contributions",
      value: stats.totalContributions,
      className: "text-foreground",
    },
    {
      label: "Modérateurs actifs",
      value: stats.moderateursActifs,
      className: "text-foreground",
    },
    {
      label: "Actions cette semaine",
      value: stats.actionsThisWeek,
      className: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-4 pb-4 text-center space-y-1">
            <p className={`text-3xl font-bold tabular-nums ${card.className}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
