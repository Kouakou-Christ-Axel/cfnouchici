import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { listMotsValides, getMotBySlug } from "@/lib/queries/mots";

describe("listMotsValides", () => {
  beforeAll(async () => {
    // Clean slate
    await db.exemple.deleteMany();
    await db.mot.deleteMany();

    await db.mot.createMany({
      data: [
        { slug: "goumin", mot: "Goumin", definition: "Se battre", statut: "VALIDE", categorie: "VERBE" },
        { slug: "choco", mot: "Choco", definition: "Ami proche", statut: "VALIDE", categorie: "NOM" },
        { slug: "brouteur", mot: "Brouteur", definition: "Arnaqueur", statut: "EN_ATTENTE", categorie: "NOM" },
      ],
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
  it("returns a word with exemples", async () => {
    const mot = await db.mot.findUnique({ where: { slug: "goumin" } });
    await db.exemple.create({ data: { phrase: "On va goumin!", motId: mot!.id } });

    const result = await getMotBySlug("goumin");
    expect(result).not.toBeNull();
    expect(result!.exemples.length).toBeGreaterThanOrEqual(1);
  });

  it("returns null for unknown slug", async () => {
    const result = await getMotBySlug("not-existing");
    expect(result).toBeNull();
  });
});
