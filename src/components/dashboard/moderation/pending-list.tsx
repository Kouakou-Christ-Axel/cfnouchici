import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PendingItem } from "@/components/dashboard/moderation/pending-item";

interface PendingMot {
  id: string;
  slug: string;
  mot: string;
  definition: string;
  categorie: string | null;
  popularityScore: number;
  createdAt: Date;
  soumisPar: { name: string } | null;
  _count: { votes: number };
}

interface PendingListProps {
  mots: PendingMot[];
}

export function PendingList({ mots }: PendingListProps) {
  if (mots.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          🎉 Aucun mot en attente. File vide !
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {mots.map((m, i) => (
          <div key={m.id}>
            {i > 0 && <Separator />}
            <PendingItem
              slug={m.slug}
              mot={m.mot}
              definition={m.definition}
              categorie={m.categorie}
              popularityScore={m.popularityScore}
              createdAt={m.createdAt}
              authorName={m.soumisPar?.name ?? null}
              voteCount={m._count.votes}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
