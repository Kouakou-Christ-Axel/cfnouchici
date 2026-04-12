import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { recomputeMotScore } from "@/lib/score/recompute-mot-score";

const voter1 = "test-voter-score-1";
const voter2 = "test-voter-score-2";

describe("recomputeMotScore", () => {
  let motId: string;

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: voter1 },
      update: {},
      create: { id: voter1, name: "V1", email: "v1@test.com", emailVerified: false },
    });
    await db.user.upsert({
      where: { id: voter2 },
      update: {},
      create: { id: voter2, name: "V2", email: "v2@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
    const mot = await db.mot.create({
      data: { slug: "score-test", mot: "ScoreTest", definition: "def", statut: "VALIDE" },
    });
    motId = mot.id;
  });

  it("sets score to 0 when there are no votes", async () => {
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    expect(mot!.popularityScore).toBe(0);
  });

  it("computes score from positive votes", async () => {
    await db.voteMot.create({
      data: { motId, userId: voter1, connaissance: "OUI_UTILISE", exactitude: "EXACTE" },
    });
    await db.voteMot.create({
      data: { motId, userId: voter2, connaissance: "OUI_UTILISE", exactitude: "EXACTE" },
    });
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    expect(mot!.popularityScore).toBeGreaterThan(12);
    expect(mot!.popularityScore).toBeLessThan(13);
  });

  it("factors in socialScore from the mot", async () => {
    await db.mot.update({ where: { id: motId }, data: { socialScore: 5 } });
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    expect(mot!.popularityScore).toBe(15);
  });

  it("handles negative votes", async () => {
    await db.voteMot.create({
      data: { motId, userId: voter1, connaissance: "JAMAIS_ENTENDU", exactitude: "FAUSSE" },
    });
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    expect(mot!.popularityScore).toBeLessThan(-2);
    expect(mot!.popularityScore).toBeGreaterThan(-3);
  });
});
