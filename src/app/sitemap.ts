import type { MetadataRoute } from "next";
import { generateSitemapEntries } from "@/lib/sitemap";

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return generateSitemapEntries();
}
