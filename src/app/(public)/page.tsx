import type { Metadata } from "next";
import HeroSection from "@/components/public/accueil/hero-section";
import PopularWordsSection from "@/components/public/accueil/popular-words-section";
import RecentWordsSection from "@/components/public/accueil/recent-words-section";
import { Separator } from "@/components/ui/separator";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const count = await db.mot.count({ where: { statut: "VALIDE" } });
  return {
    title: "Nouchici — Le dictionnaire du nouchi ivoirien",
    description: `Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire. ${count > 0 ? `+${count}` : "Des"} mots documentés par la communauté.`,
  };
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nouchici",
    url: process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci",
    description:
      "Le dictionnaire collaboratif du nouchi, l'argot urbain ivoirien.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci"}/mots?search={search_term_string}`,
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
      <HeroSection />
      <Separator />
      <PopularWordsSection />
      <Separator />
      <RecentWordsSection />
    </>
  );
}
