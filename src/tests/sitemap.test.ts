import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { generateSitemapEntries } from "@/lib/sitemap";

describe("generateSitemapEntries", () => {
  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  it("includes homepage with priority 1.0", async () => {
    const entries = await generateSitemapEntries();
    const home = entries.find((e) => e.url.endsWith("/"));
    expect(home).toBeDefined();
    expect(home!.priority).toBe(1.0);
  });

  it("includes /mots list page with priority 0.6", async () => {
    const entries = await generateSitemapEntries();
    const liste = entries.find((e) => /\/mots$/.test(e.url));
    expect(liste).toBeDefined();
    expect(liste!.priority).toBe(0.6);
  });

  it("includes /a-propos static page", async () => {
    const entries = await generateSitemapEntries();
    const about = entries.find((e) => e.url.endsWith("/a-propos"));
    expect(about).toBeDefined();
  });

  it("includes validated words with priority 0.8", async () => {
    await db.mot.create({
      data: {
        slug: "test-mot",
        mot: "Test",
        definition: "Définition test",
        statut: "VALIDE",
      },
    });
    const entries = await generateSitemapEntries();
    const motEntry = entries.find((e) => e.url.includes("/mots/test-mot"));
    expect(motEntry).toBeDefined();
    expect(motEntry!.priority).toBe(0.8);
  });

  it("excludes non-validated words", async () => {
    await db.mot.create({
      data: {
        slug: "pending-mot",
        mot: "Pending",
        definition: "Définition en attente",
        statut: "EN_ATTENTE",
      },
    });
    const entries = await generateSitemapEntries();
    expect(entries.some((e) => e.url.includes("pending-mot"))).toBe(false);
  });

  it("word entries include lastModified from updatedAt", async () => {
    const fixedDate = new Date("2026-01-01T00:00:00Z");
    await db.mot.create({
      data: {
        slug: "dated-mot",
        mot: "Dated",
        definition: "Définition datée",
        statut: "VALIDE",
        updatedAt: fixedDate,
      },
    });
    const entries = await generateSitemapEntries();
    const motEntry = entries.find((e) => e.url.includes("/mots/dated-mot"));
    expect(motEntry!.lastModified).toEqual(fixedDate);
  });
});
