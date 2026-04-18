import Link from "next/link";
import type { Categorie } from "@/generated/prisma";
import { WordCard } from "@/components/public/accueil/word-card";

interface MotSummary {
  slug: string;
  mot: string;
  definition: string | null;
  categorie: Categorie | null;
  soumisPar: { name: string } | null;
}

interface PopularWordsSectionProps {
  mots: MotSummary[];
}

function PopularWordsSection({ mots }: PopularWordsSectionProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="content-container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-(family-name:--font-heading) text-2xl font-extrabold tracking-tight">
            Mots du moment
          </h2>
          <Link
            href="/mots"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mots.map((mot) => (
            <WordCard
              key={mot.slug}
              slug={mot.slug}
              mot={mot.mot}
              definition={mot.definition ?? ""}
              categorie={mot.categorie}
              authorName={mot.soumisPar?.name ?? null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularWordsSection;
