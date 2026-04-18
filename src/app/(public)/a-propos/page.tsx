import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "À propos — Nouchici",
  description:
    "Nouchici est le dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire. Découvrez notre mission et comment contribuer.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci"}/a-propos`,
  },
  openGraph: {
    title: "À propos de Nouchici",
    description:
      "Nouchici est le dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire.",
    url: `${process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci"}/a-propos`,
    type: "website",
  },
};

export default function AProposPage() {
  return (
    <div className="content-container py-12 space-y-12 max-w-3xl">

      <header className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          À propos
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Nouchici est le dictionnaire collaboratif du nouchi — l&apos;argot urbain né à Abidjan, parlé dans toute la Côte d&apos;Ivoire et sa diaspora.
        </p>
      </header>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Notre mission</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            Le nouchi est une langue vivante, hybride et créative — mélange de français, de dioula, de bété et de dizaines d&apos;autres langues. Pourtant, il reste peu documenté, peu enseigné, souvent absent des références académiques.
          </p>
          <p>
            Nouchici est né d&apos;un constat simple : cette langue mérite une référence sérieuse, contrôlée depuis la Côte d&apos;Ivoire, accessible à tous — qu&apos;on soit à Yopougon, à Paris ou à Montréal.
          </p>
          <p>
            Chaque fiche mot est rédigée avec soin : définition claire, exemple d&apos;usage réel, catégorie grammaticale. L&apos;objectif est que n&apos;importe quel journaliste, chercheur ou créateur puisse citer Nouchici comme source.
          </p>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Contexte culturel</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            Le nouchi est apparu dans les années 1970–80 dans les quartiers populaires d&apos;Abidjan. Langue des jeunes, des marchés, de la musique urbaine, il s&apos;est imposé comme vecteur d&apos;identité culturelle ivoirienne.
          </p>
          <p>
            Aujourd&apos;hui parlé par des millions de personnes, le nouchi continue d&apos;évoluer. De nouveaux mots apparaissent chaque année, enrichis par internet, les réseaux sociaux et la scène coupé-décalé.
          </p>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">L&apos;équipe</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            Nouchici est un projet indépendant fondé par <strong className="text-foreground">Axel Kouakou</strong>, développeur et passionné de linguistique urbaine.
          </p>
          <p>
            Le projet est communautaire par nature : les mots sont soumis et validés par des locuteurs natifs.
          </p>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Comment contribuer</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            Tu connais un mot nouchi qui manque au dictionnaire ? Crée un compte et soumets-le. Notre équipe de modération vérifie chaque contribution avant publication.
          </p>
          <p>
            Critères d&apos;acceptation : le mot doit être réellement utilisé, la définition doit être claire, et un exemple d&apos;usage réel est requis.
          </p>
        </div>
      </section>

    </div>
  );
}
