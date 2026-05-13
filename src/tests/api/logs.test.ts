import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { listLogs } from "@/lib/queries/logs";

const mod1 = "test-mod-1";
const mod2 = "test-mod-2";

describe("listLogs", () => {
  let motId: string;

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: mod1 },
      update: {},
      create: { id: mod1, name: "Mod1", email: "m1@x.com", emailVerified: false, role: "MODERATEUR" },
    });
    await db.user.upsert({
      where: { id: mod2 },
      update: {},
      create: { id: mod2, name: "Mod2", email: "m2@x.com", emailVerified: false, role: "MODERATEUR" },
    });
  });

  beforeEach(async () => {
    await db.logModeration.deleteMany();
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
    const mot = await db.mot.create({
      data: { slug: "log-test", mot: "LogTest", statut: "EN_ATTENTE" },
    });
    motId = mot.id;
  });

  it("returns logs ordered by date desc", async () => {
    const base = new Date("2026-01-01T10:00:00Z");
    await db.logModeration.createMany({
      data: [
        { action: "VALIDE", motId, moderateurId: mod1, createdAt: new Date(base.getTime() + 0) },
        { action: "EDITE", motId, moderateurId: mod1, createdAt: new Date(base.getTime() + 1000) },
        { action: "REJETE", motif: "raison", motId, moderateurId: mod2, createdAt: new Date(base.getTime() + 2000) },
      ],
    });
    const result = await listLogs();
    expect(result.data).toHaveLength(3);
    // last created is first
    expect(result.data[0].action).toBe("REJETE");
  });

  it("filters by action", async () => {
    await db.logModeration.createMany({
      data: [
        { action: "VALIDE", motId, moderateurId: mod1 },
        { action: "REJETE", motif: "r", motId, moderateurId: mod1 },
      ],
    });
    const result = await listLogs({ action: "VALIDE" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].action).toBe("VALIDE");
  });

  it("filters by moderateur", async () => {
    await db.logModeration.createMany({
      data: [
        { action: "VALIDE", motId, moderateurId: mod1 },
        { action: "VALIDE", motId, moderateurId: mod2 },
      ],
    });
    const result = await listLogs({ moderateurId: mod2 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].moderateurId).toBe(mod2);
  });

  it("filters by date range", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.logModeration.create({
      data: { action: "VALIDE", motId, moderateurId: mod1, createdAt: new Date("2026-01-01") },
    });
    await db.logModeration.create({
      data: { action: "VALIDE", motId, moderateurId: mod1 },
    });
    const result = await listLogs({ from: yesterday });
    expect(result.data).toHaveLength(1);
  });
});
