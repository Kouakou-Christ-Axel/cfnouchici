interface HeroStatsProps {
  stats: {
    mots: number;
    contributeurs: number;
    votes: number;
  };
}

export function HeroStats({ stats }: HeroStatsProps) {
  const items = [
    { value: stats.mots, label: "Mots" },
    { value: stats.contributeurs, label: "Contributeurs" },
    { value: stats.votes >= 1000 ? `${(stats.votes / 1000).toFixed(1)}k` : stats.votes, label: "Votes" },
  ];

  return (
    <div className="flex justify-center gap-10 md:gap-16 mt-12 pt-8 border-t border-border">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
            {item.value}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
