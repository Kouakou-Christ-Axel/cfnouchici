import Link from "next/link";
import { getRecentMots } from "@/lib/queries/mots";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RecentWordRow } from "@/components/public/accueil/recent-word-row";

async function RecentWordsSection() {
  const mots = await getRecentMots(6);

  return (
    <section className="py-16 md:py-20">
      <div className="content-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <h2 className="font-(family-name:--font-heading) text-2xl font-extrabold tracking-tight">
            Derniers ajouts
          </h2>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/proposer">+ Proposer un mot</Link>
          </Button>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {mots.map((mot, index) => (
            <div key={mot.slug}>
              {index > 0 && <Separator />}
              <RecentWordRow
                slug={mot.slug}
                mot={mot.mot}
                definition={mot.definition}
                categorie={mot.categorie}
                authorName={mot.soumisPar?.name ?? null}
                createdAt={mot.createdAt}
                index={index}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/mots">Voir tous les ajouts →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default RecentWordsSection;
