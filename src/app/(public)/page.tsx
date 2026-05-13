import type { Metadata } from "next";
import HeroSection from "@/components/public/accueil/hero-section";
import PopularWordsSection from "@/components/public/accueil/popular-words-section";
import RecentWordsSection from "@/components/public/accueil/recent-words-section";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { getPopularMots } from "@/lib/queries/mots";
import { BASE_URL } from "@/lib/seo";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const count = await db.mot.count({ where: { statut: "VALIDE" } });
  return {
    title: "nouchi.ci — Le dictionnaire du nouchi ivoirien",
    description: `Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire. ${count > 0 ? `+${count}` : "Des"} mots documentés par la communauté.`,
    alternates: {
      canonical: BASE_URL,
    },
  };
}

export default async function Home() {
  const [mots, wordCount, contributorCount, voteCount] = await Promise.all([
    getPopularMots(6),
    db.mot.count({ where: { statut: "VALIDE" } }),
    db.user.count(),
    db.voteMot.count(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "nouchi.ci",
    url: BASE_URL,
    description: "Le dictionnaire collaboratif du nouchi, l'argot urbain ivoirien.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/mots?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection
        mots={mots}
        wordCount={wordCount}
        contributorCount={contributorCount}
        voteCount={voteCount}
      />
      <Separator />
      <PopularWordsSection mots={mots} />
      <Separator />
      <RecentWordsSection />
    </>
  );
}
