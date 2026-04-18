import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci";
const SITE_NAME = "Nouchici — Dictionnaire du nouchi ivoirien";

interface MotForSeo {
  slug: string;
  mot: string;
  definition: string;
  categorie?: string | null;
  updatedAt?: Date;
}

export function buildMotMetadata(mot: MotForSeo): Metadata {
  const title = `${mot.mot} — Définition nouchi | Nouchici`;
  const description = `Définition de "${mot.mot}" en nouchi ivoirien : ${mot.definition}`;
  const url = `${BASE_URL}/mots/${mot.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      ...(mot.updatedAt ? { modifiedTime: mot.updatedAt.toISOString() } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildMotJsonLd(mot: MotForSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: mot.mot,
    description: mot.definition,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Dictionnaire Nouchi — Nouchici",
      url: BASE_URL,
    },
  };
}
