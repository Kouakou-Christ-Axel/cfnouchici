import { db } from "@/lib/db";
import { getPopularMots } from "@/lib/queries/mots";
import { HeroTitle } from "@/components/public/accueil/hero-title";
import { HeroSearch } from "@/components/public/accueil/hero-search";
import { HeroTags } from "@/components/public/accueil/hero-tags";
import { HeroStats } from "@/components/public/accueil/hero-stats";

export default async function HeroSection() {
  const [mots, wordCount, contributorCount, voteCount] = await Promise.all([
    getPopularMots(6),
    db.mot.count({ where: { statut: "VALIDE" } }),
    db.user.count(),
    db.voteMot.count(),
  ]);

  const tags = mots.map((m) => ({ slug: m.slug, mot: m.mot }));

  return (
    <section className="py-16 md:py-24 text-center">
      <div className="content-container">
        <HeroTitle wordCount={wordCount} />
        <HeroSearch />
        <HeroTags mots={tags} />
        <HeroStats stats={{ mots: wordCount, contributeurs: contributorCount, votes: voteCount }} />
      </div>
    </section>
  );
}
