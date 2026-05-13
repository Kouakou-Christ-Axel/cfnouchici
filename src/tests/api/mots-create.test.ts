import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { createMot } from "@/lib/mutations/mots";

describe("createMot", () => {
  const userId = "test-user-create";

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: "Test User",
        email: "testcreate@example.com",
        emailVerified: false,
      },
    });
  });

  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  it("creates a word with EN_ATTENTE status", async () => {
    const mot = await createMot(
      { mot: "Dja", definition: "Partir rapidement", categorie: "VERBE", exemples: ["Il a dja du maquis."] },
      userId
    );
    expect(mot.statut).toBe("EN_ATTENTE");
    expect(mot.slug).toBe("dja");
    expect(mot.soumisParId).toBe(userId);
    expect(mot.sens[0].exemples).toHaveLength(1);
  });

  it("generates a slug automatically", async () => {
    const mot = await createMot(
      { mot: "C'est comment", definition: "Salutation", exemples: [] },
      userId
    );
    expect(mot.slug).toBe("cest-comment");
  });

  it("throws on duplicate slug", async () => {
    await createMot({ mot: "unique", definition: "Test", exemples: [] }, userId);
    await expect(
      createMot({ mot: "unique", definition: "Autre", exemples: [] }, userId)
    ).rejects.toThrow("SLUG_EXISTS");
  });

  it("creates a word without a user (anonymous)", async () => {
    const mot = await createMot(
      { mot: "Gogoro", definition: "Quelqu'un de bizarre", exemples: [] },
      null
    );
    expect(mot.statut).toBe("EN_ATTENTE");
    expect(mot.soumisParId).toBeNull();
  });
});
