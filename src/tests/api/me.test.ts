import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { getMyStats, listMyPropositions } from "@/lib/queries/me";
import { deleteMyProposition, updateMyProfile } from "@/lib/mutations/me";

const userId = "test-me-user";

describe("me queries/mutations", () => {
  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "Me", email: "me@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  describe("getMyStats", () => {
    it("returns zero stats for a user with no propositions", async () => {
      const stats = await getMyStats(userId);
      expect(stats.total).toBe(0);
      expect(stats.validated).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.rejected).toBe(0);
      expect(stats.recentPropositions).toHaveLength(0);
    });

    it("counts propositions by status", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", statut: "VALIDE", soumisParId: userId },
          { slug: "b", mot: "B", statut: "VALIDE", soumisParId: userId },
          { slug: "c", mot: "C", statut: "EN_ATTENTE", soumisParId: userId },
          { slug: "d", mot: "D", statut: "REJETE", soumisParId: userId },
        ],
      });
      const stats = await getMyStats(userId);
      expect(stats.total).toBe(4);
      expect(stats.validated).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.rejected).toBe(1);
    });

    it("returns 5 most recent propositions", async () => {
      await db.mot.createMany({
        data: Array.from({ length: 7 }).map((_, i) => ({
          slug: `slug-${i}`,
          mot: `Mot${i}`,
          statut: "EN_ATTENTE" as const,
          soumisParId: userId,
        })),
      });
      const stats = await getMyStats(userId);
      expect(stats.recentPropositions).toHaveLength(5);
    });
  });

  describe("listMyPropositions", () => {
    beforeEach(async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", statut: "VALIDE", soumisParId: userId },
          { slug: "b", mot: "B", statut: "EN_ATTENTE", soumisParId: userId },
          { slug: "c", mot: "C", statut: "REJETE", soumisParId: userId },
        ],
      });
    });

    it("returns only propositions of the given user", async () => {
      const result = await listMyPropositions(userId, {});
      expect(result.data).toHaveLength(3);
    });

    it("filters by statut", async () => {
      const result = await listMyPropositions(userId, { statut: "VALIDE" });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe("a");
    });

    it("supports search", async () => {
      const result = await listMyPropositions(userId, { search: "A" });
      expect(result.data.some((m) => m.mot === "A")).toBe(true);
    });
  });

  describe("deleteMyProposition", () => {
    it("deletes the user's own EN_ATTENTE word", async () => {
      await db.mot.create({
        data: { slug: "tokill", mot: "ToKill", statut: "EN_ATTENTE", soumisParId: userId },
      });
      await deleteMyProposition(userId, "tokill");
      const found = await db.mot.findUnique({ where: { slug: "tokill" } });
      expect(found).toBeNull();
    });

    it("throws if the mot does not belong to the user", async () => {
      await db.mot.create({
        data: { slug: "notmine", mot: "NotMine", statut: "EN_ATTENTE" },
      });
      await expect(deleteMyProposition(userId, "notmine")).rejects.toThrow();
    });

    it("throws if the mot is already validated", async () => {
      await db.mot.create({
        data: { slug: "valid", mot: "Valid", statut: "VALIDE", soumisParId: userId },
      });
      await expect(deleteMyProposition(userId, "valid")).rejects.toThrow();
    });
  });

  describe("updateMyProfile", () => {
    it("updates the user name", async () => {
      await updateMyProfile(userId, { name: "New Name" });
      const user = await db.user.findUnique({ where: { id: userId } });
      expect(user!.name).toBe("New Name");
    });
  });
});
