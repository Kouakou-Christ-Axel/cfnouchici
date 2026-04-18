import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { searchMots } from "@/lib/queries/search";

describe("searchMots", () => {
  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.mot.deleteMany();

    await db.mot.createMany({
      data: [
        { slug: "goumin", mot: "Goumin", definition: "Se battre, se disputer", statut: "VALIDE", categorie: "VERBE" },
        { slug: "choco", mot: "Choco", definition: "Ami proche, meilleur ami", statut: "VALIDE", categorie: "NOM" },
        { slug: "brouteur", mot: "Brouteur", definition: "Arnaqueur sur internet", statut: "EN_ATTENTE", categorie: "NOM" },
      ],
    });
  });

  it("finds exact word match", async () => {
    const results = await searchMots("goumin");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("goumin");
  });

  it("only returns VALIDE words", async () => {
    const results = await searchMots("brouteur");
    expect(results.every((r) => r.statut === "VALIDE")).toBe(true);
  });

  it("returns empty array for empty query", async () => {
    const results = await searchMots("");
    expect(results).toEqual([]);
  });

  it("returns empty array for whitespace-only query", async () => {
    const results = await searchMots("   ");
    expect(results).toEqual([]);
  });

  it("finds word by partial definition match", async () => {
    const results = await searchMots("battre");
    expect(results.some((r) => r.slug === "goumin")).toBe(true);
  });

  it("returns results within 200ms", async () => {
    const start = Date.now();
    await searchMots("goumin");
    expect(Date.now() - start).toBeLessThan(200);
  });

  it("finds word with fuzzy match (typo tolerance)", async () => {
    const results = await searchMots("gouminn");
    expect(results.some((r) => r.slug === "goumin")).toBe(true);
  });
});
