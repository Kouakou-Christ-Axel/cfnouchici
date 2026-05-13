import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { updateMot, deleteMot } from "@/lib/mutations/mots";
import { createMot } from "@/lib/mutations/mots";

describe("updateMot", () => {
  const userId = "test-user-update";

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "Updater", email: "updater@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  it("updates definition", async () => {
    const created = await createMot({ mot: "updatetest", definition: "Old", exemples: [] }, userId);
    const updated = await updateMot(created.slug, { definition: "New definition" });
    expect(updated!.sens[0]?.definition).toBe("New definition");
  });

  it("updates exemples by replacing them", async () => {
    const created = await createMot(
      { mot: "exempletest", definition: "Def", exemples: ["Old example"] },
      userId
    );
    const updated = await updateMot(created.slug, { exemples: ["New example 1", "New example 2"] });
    expect(updated!.sens[0]?.exemples).toHaveLength(2);
    expect(updated!.sens[0]?.exemples[0].phrase).toBe("New example 1");
  });

  it("updates slug when mot changes", async () => {
    const created = await createMot({ mot: "oldname", definition: "Def", exemples: [] }, userId);
    const updated = await updateMot(created.slug, { mot: "newname" });
    expect(updated!.slug).toBe("newname");
  });
});

describe("deleteMot", () => {
  const userId = "test-user-delete";

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "Deleter", email: "deleter@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  it("deletes a word and its exemples", async () => {
    const created = await createMot({ mot: "tobedeleted", definition: "Def", exemples: ["example"] }, userId);
    await deleteMot(created.slug);
    const found = await db.mot.findUnique({ where: { slug: "tobedeleted" } });
    expect(found).toBeNull();
  });
});
