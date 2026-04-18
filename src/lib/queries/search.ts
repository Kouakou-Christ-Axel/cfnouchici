import { db } from "@/lib/db";

export interface SearchResult {
  id: string;
  slug: string;
  mot: string;
  definition: string;
  statut: string;
  categorie: string | null;
}

export async function searchMots(q: string): Promise<SearchResult[]> {
  if (q.trim().length < 2) return [];

  const results = await db.$queryRaw<SearchResult[]>`
    SELECT id, slug, mot, definition, statut::text, categorie::text
    FROM mot
    WHERE statut = 'VALIDE'
      AND (
        similarity(mot, ${q}) > 0.1
        OR similarity(definition, ${q}) > 0.08
        OR mot ILIKE ${"%" + q + "%"}
        OR definition ILIKE ${"%" + q + "%"}
      )
    ORDER BY
      similarity(mot, ${q}) DESC,
      similarity(definition, ${q}) DESC
    LIMIT 10
  `;

  return results;
}
