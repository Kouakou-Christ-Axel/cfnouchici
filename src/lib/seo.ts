import type { Metadata } from "next";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://www.nouchi.ci";
const SITE_NAME = "nouchi.ci";

interface MotForSeo {
  slug: string;
  mot: string;
  sens: Array<{ definition: string; categorie?: string | null }>;
  updatedAt?: Date;
}

export function buildMotMetadata(mot: MotForSeo): Metadata {
  const primarySens = mot.sens[0];
  const title = `${mot.mot} — Définition nouchi | nouchi.ci`;
  const description = `Définition de "${mot.mot}" en nouchi ivoirien : ${primarySens?.definition ?? ""}`;
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
  const primarySens = mot.sens[0];
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: mot.mot,
    description: primarySens?.definition ?? "",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Dictionnaire Nouchi — nouchi.ci",
      url: BASE_URL,
    },
  };
}
