import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { upsertVote } from "@/lib/mutations/votes";
import { getVoteSummary, getUserVote } from "@/lib/queries/votes";

const userId1 = "test-voter-1";
const userId2 = "test-voter-2";

describe("votes", () => {
  let motId: string;

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId1 },
      update: {},
      create: { id: userId1, name: "Voter1", email: "voter1@test.com", emailVerified: false },
    });
    await db.user.upsert({
      where: { id: userId2 },
      update: {},
      create: { id: userId2, name: "Voter2", email: "voter2@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
    const mot = await db.mot.create({
      data: { slug: "votetest", mot: "VoteTest", definition: "def", statut: "VALIDE" },
    });
    motId = mot.id;
  });

  describe("upsertVote", () => {
    it("creates a new vote", async () => {
      const vote = await upsertVote(motId, userId1, {
        connaissance: "OUI_UTILISE",
        exactitude: "EXACTE",
      });
      expect(vote.connaissance).toBe("OUI_UTILISE");
      expect(vote.exactitude).toBe("EXACTE");
    });

    it("upserts on re-vote", async () => {
      await upsertVote(motId, userId1, { connaissance: "OUI_UTILISE", exactitude: "EXACTE" });
      const updated = await upsertVote(motId, userId1, { connaissance: "CONNAIS", exactitude: "APPROXIMATIVE" });
      expect(updated.connaissance).toBe("CONNAIS");

      const count = await db.voteMot.count({ where: { motId, userId: userId1 } });
      expect(count).toBe(1);
    });
  });

  describe("getVoteSummary", () => {
    it("returns aggregated counts", async () => {
      await upsertVote(motId, userId1, { connaissance: "OUI_UTILISE", exactitude: "EXACTE" });
      await upsertVote(motId, userId2, { connaissance: "CONNAIS", exactitude: "APPROXIMATIVE" });

      const summary = await getVoteSummary(motId);
      expect(summary.totalVotes).toBe(2);
      expect(summary.connaissance.OUI_UTILISE).toBe(1);
      expect(summary.connaissance.CONNAIS).toBe(1);
      expect(summary.exactitude.EXACTE).toBe(1);
      expect(summary.exactitude.APPROXIMATIVE).toBe(1);
    });

    it("returns zeros when no votes", async () => {
      const summary = await getVoteSummary(motId);
      expect(summary.totalVotes).toBe(0);
    });
  });

  describe("getUserVote", () => {
    it("returns user vote if exists", async () => {
      await upsertVote(motId, userId1, { connaissance: "OUI_UTILISE", exactitude: "EXACTE" });
      const vote = await getUserVote(motId, userId1);
      expect(vote).not.toBeNull();
      expect(vote!.connaissance).toBe("OUI_UTILISE");
    });

    it("returns null if no vote", async () => {
      const vote = await getUserVote(motId, userId1);
      expect(vote).toBeNull();
    });
  });
});
