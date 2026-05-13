import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { listMotsValides, getMotBySlug } from "@/lib/queries/mots";

describe("listMotsValides", () => {
  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.sens.deleteMany();
    await db.mot.deleteMany();

    await db.mot.create({
      data: {
        slug: "goumin", mot: "Goumin", statut: "VALIDE",
        sens: { create: [{ categorie: "VERBE", definition: "Se battre", traductions: [], ordre: 0 }] },
      },
    });
    await db.mot.create({
      data: {
        slug: "choco", mot: "Choco", statut: "VALIDE",
        sens: { create: [{ categorie: "NOM", definition: "Ami proche", traductions: [], ordre: 0 }] },
      },
    });
    await db.mot.create({
      data: {
        slug: "brouteur", mot: "Brouteur", statut: "EN_ATTENTE",
        sens: { create: [{ categorie: "NOM", definition: "Arnaqueur", traductions: [], ordre: 0 }] },
      },
    });
  });

  it("returns only VALIDE words", async () => {
    const result = await listMotsValides();
    expect(result.data).toHaveLength(2);
    expect(result.data.every((m) => m.statut === "VALIDE")).toBe(true);
  });

  it("filters by lettre", async () => {
    const result = await listMotsValides({ lettre: "g" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe("goumin");
  });

  it("filters by categorie", async () => {
    const result = await listMotsValides({ categorie: "NOM" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe("choco");
  });

  it("supports pagination with cursor", async () => {
    const first = await listMotsValides({ limit: 1 });
    expect(first.data).toHaveLength(1);
    expect(first.nextCursor).not.toBeNull();

    const second = await listMotsValides({ limit: 1, cursor: first.nextCursor! });
    expect(second.data).toHaveLength(1);
    expect(second.data[0].slug).not.toBe(first.data[0].slug);
  });
});

describe("getMotBySlug", () => {
  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.sens.deleteMany();
    await db.mot.deleteMany();
  });

  it("returns a word with exemples", async () => {
    await db.mot.create({
      data: {
        slug: "goumin", mot: "Goumin", statut: "VALIDE",
        sens: {
          create: [{
            categorie: "VERBE", definition: "Se battre", traductions: [], ordre: 0,
            exemples: { create: [{ phrase: "On va goumin!" }] },
          }],
        },
      },
    });

    const result = await getMotBySlug("goumin");
    expect(result).not.toBeNull();
    expect(result!.sens[0].exemples.length).toBeGreaterThanOrEqual(1);
  });

  it("returns null for unknown slug", async () => {
    const result = await getMotBySlug("not-existing");
    expect(result).toBeNull();
  });
});
