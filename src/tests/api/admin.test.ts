import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { listAllMots, getMotStats, getAdminStats } from "@/lib/queries/admin";
import { validerMot, rejeterMot, editerMotAdmin } from "@/lib/mutations/moderation";

const modId = "test-moderateur";
const userId = "test-user-admin";

describe("admin queries and mutations", () => {
  beforeAll(async () => {
    await db.user.upsert({
      where: { id: modId },
      update: {},
      create: { id: modId, name: "Mod", email: "mod@test.com", emailVerified: false, role: "MODERATEUR" },
    });
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "User", email: "user-admin@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.logModeration.deleteMany();
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  describe("listAllMots", () => {
    it("returns all mots regardless of statut", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", statut: "VALIDE" },
          { slug: "b", mot: "B", statut: "EN_ATTENTE" },
          { slug: "c", mot: "C", statut: "REJETE" },
        ],
      });
      const result = await listAllMots({});
      expect(result.data).toHaveLength(3);
    });

    it("filters by statut", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", statut: "EN_ATTENTE" },
          { slug: "b", mot: "B", statut: "VALIDE" },
        ],
      });
      const result = await listAllMots({ statut: "EN_ATTENTE" });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe("a");
    });

    it("sorts by popularity when sort=popularity", async () => {
      await db.mot.createMany({
        data: [
          { slug: "low", mot: "Low", statut: "EN_ATTENTE", popularityScore: 1 },
          { slug: "high", mot: "High", statut: "EN_ATTENTE", popularityScore: 100 },
          { slug: "mid", mot: "Mid", statut: "EN_ATTENTE", popularityScore: 50 },
        ],
      });
      const result = await listAllMots({ statut: "EN_ATTENTE", sort: "popularity" });
      expect(result.data[0].slug).toBe("high");
      expect(result.data[2].slug).toBe("low");
    });

    it("supports pagination", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", statut: "EN_ATTENTE" },
          { slug: "b", mot: "B", statut: "EN_ATTENTE" },
        ],
      });
      const first = await listAllMots({ limit: 1 });
      expect(first.data).toHaveLength(1);
      expect(first.nextCursor).not.toBeNull();
    });
  });

  describe("validerMot", () => {
    it("changes statut to VALIDE and creates log", async () => {
      await db.mot.create({ data: { slug: "test", mot: "Test", statut: "EN_ATTENTE" } });
      const result = await validerMot("test", modId);
      expect(result.statut).toBe("VALIDE");
      expect(result.valideParId).toBe(modId);

      const logs = await db.logModeration.findMany({ where: { motId: result.id } });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("VALIDE");
      expect(logs[0].moderateurId).toBe(modId);
    });
  });

  describe("rejeterMot", () => {
    it("changes statut to REJETE with motif and creates log", async () => {
      await db.mot.create({ data: { slug: "rej", mot: "Rej", statut: "EN_ATTENTE" } });
      const result = await rejeterMot("rej", modId, "Définition incorrecte");
      expect(result.statut).toBe("REJETE");
      expect(result.motifRejet).toBe("Définition incorrecte");

      const logs = await db.logModeration.findMany({ where: { motId: result.id } });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("REJETE");
      expect(logs[0].motif).toBe("Définition incorrecte");
    });
  });

  describe("editerMotAdmin", () => {
    it("updates fields and creates EDITE log", async () => {
      await db.mot.create({
        data: {
          slug: "edit", mot: "Edit", statut: "EN_ATTENTE",
          sens: { create: [{ categorie: "NOM", definition: "old", traductions: [], ordre: 0 }] },
        },
      });
      const result = await editerMotAdmin("edit", { definition: "new definition" }, modId);
      expect(result!.sens[0]?.definition).toBe("new definition");

      const logs = await db.logModeration.findMany({ where: { motId: result!.id } });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("EDITE");
    });
  });

  describe("getMotStats", () => {
    it("returns vote aggregation for a mot", async () => {
      const mot = await db.mot.create({ data: { slug: "stats", mot: "Stats", statut: "VALIDE" } });
      await db.voteMot.createMany({
        data: [
          { motId: mot.id, userId: userId, connaissance: "OUI_UTILISE", exactitude: "EXACTE" },
          { motId: mot.id, userId: modId, connaissance: "CONNAIS", exactitude: "APPROXIMATIVE" },
        ],
      });
      const stats = await getMotStats(mot.id);
      expect(stats.totalVotes).toBe(2);
      expect(stats.connaissance.OUI_UTILISE).toBe(1);
      expect(stats.connaissance.CONNAIS).toBe(1);
      expect(stats.exactitude.EXACTE).toBe(1);
    });
  });

  describe("getAdminStats", () => {
    it("returns counts by statut", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", statut: "EN_ATTENTE" },
          { slug: "b", mot: "B", statut: "EN_ATTENTE" },
          { slug: "c", mot: "C", statut: "VALIDE" },
        ],
      });
      const stats = await getAdminStats();
      expect(stats.parStatut.EN_ATTENTE).toBe(2);
      expect(stats.parStatut.VALIDE).toBe(1);
      expect(stats.parStatut.REJETE).toBe(0);
    });
  });
});
