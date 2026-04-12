import Link from "next/link";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Proposition {
  id: string;
  slug: string;
  mot: string;
  definition: string;
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
}

interface OverviewPropsListProps {
  propositions: Proposition[];
}

export function OverviewPropsList({ propositions }: OverviewPropsListProps) {
  if (propositions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Tu n&apos;as encore proposé aucun mot.{" "}
          <Link href="/proposer" className="text-foreground font-semibold hover:underline">
            Commence maintenant →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {propositions.map((prop, i) => (
          <div key={prop.id}>
            {i > 0 && <Separator />}
            <Link href={`/mots/${prop.slug}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="font-(family-name:--font-heading) font-bold uppercase text-sm">{prop.mot}</p>
                <p className="text-xs text-muted-foreground truncate">{prop.definition}</p>
              </div>
              <StatusChip statut={prop.statut} />
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
