import { db } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci";

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  priority: number;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}

export async function generateSitemapEntries(): Promise<SitemapEntry[]> {
  const mots = await db.mot.findMany({
    where: { statut: "VALIDE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const staticPages: SitemapEntry[] = [
    { url: `${BASE_URL}/`, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE_URL}/mots`, priority: 0.6, changeFrequency: "daily" },
    { url: `${BASE_URL}/blog`, priority: 0.5, changeFrequency: "weekly" },
    { url: `${BASE_URL}/a-propos`, priority: 0.3, changeFrequency: "monthly" },
  ];

  const motEntries: SitemapEntry[] = mots.map((m) => ({
    url: `${BASE_URL}/mots/${m.slug}`,
    lastModified: m.updatedAt,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  return [...staticPages, ...motEntries];
}
