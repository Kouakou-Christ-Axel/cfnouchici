import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { searchMots } from "@/lib/queries/search";

describe("searchMots", () => {
  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.sens.deleteMany();
    await db.mot.deleteMany();

    await db.mot.create({
      data: {
        slug: "goumin", mot: "Goumin", statut: "VALIDE",
        sens: { create: [{ categorie: "VERBE", definition: "Se battre, se disputer", traductions: [], ordre: 0 }] },
      },
    });
    await db.mot.create({
      data: {
        slug: "choco", mot: "Choco", statut: "VALIDE",
        sens: { create: [{ categorie: "NOM", definition: "Ami proche, meilleur ami", traductions: [], ordre: 0 }] },
      },
    });
    await db.mot.create({
      data: {
        slug: "brouteur", mot: "Brouteur", statut: "EN_ATTENTE",
        sens: { create: [{ categorie: "NOM", definition: "Arnaqueur sur internet", traductions: [], ordre: 0 }] },
      },
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
