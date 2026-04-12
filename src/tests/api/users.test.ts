import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { listUsers, exportUsersCsv } from "@/lib/queries/users";
import { updateUser } from "@/lib/mutations/users";

describe("users admin", () => {
  beforeEach(async () => {
    await db.logModeration.deleteMany();
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
    await db.session.deleteMany();
    await db.account.deleteMany();
    await db.user.deleteMany();
  });

  describe("listUsers", () => {
    it("lists all users", async () => {
      await db.user.createMany({
        data: [
          { id: "u1", name: "Alpha", email: "a@x.com", emailVerified: false, role: "USER" },
          { id: "u2", name: "Beta", email: "b@x.com", emailVerified: false, role: "MODERATEUR" },
        ],
      });
      const result = await listUsers();
      expect(result.data).toHaveLength(2);
    });

    it("filters by role", async () => {
      await db.user.createMany({
        data: [
          { id: "u1", name: "Alpha", email: "a@x.com", emailVerified: false, role: "USER" },
          { id: "u2", name: "Beta", email: "b@x.com", emailVerified: false, role: "ADMIN" },
        ],
      });
      const result = await listUsers({ role: "ADMIN" });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("u2");
    });

    it("searches by name", async () => {
      await db.user.createMany({
        data: [
          { id: "u1", name: "Kouakou", email: "k@x.com", emailVerified: false },
          { id: "u2", name: "Adjoa", email: "a@x.com", emailVerified: false },
        ],
      });
      const result = await listUsers({ search: "kouakou" });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Kouakou");
    });
  });

  describe("updateUser", () => {
    it("changes role", async () => {
      await db.user.create({ data: { id: "u1", name: "U", email: "u@x.com", emailVerified: false, role: "USER" } });
      await updateUser("u1", { role: "MODERATEUR" });
      const user = await db.user.findUnique({ where: { id: "u1" } });
      expect(user!.role).toBe("MODERATEUR");
    });

    it("bans a user with timestamp", async () => {
      await db.user.create({ data: { id: "u1", name: "U", email: "u@x.com", emailVerified: false } });
      await updateUser("u1", { banned: true });
      const user = await db.user.findUnique({ where: { id: "u1" } });
      expect(user!.banned).toBe(true);
      expect(user!.bannedAt).not.toBeNull();
    });

    it("unbans a user and clears timestamp", async () => {
      await db.user.create({ data: { id: "u1", name: "U", email: "u@x.com", emailVerified: false, banned: true, bannedAt: new Date() } });
      await updateUser("u1", { banned: false });
      const user = await db.user.findUnique({ where: { id: "u1" } });
      expect(user!.banned).toBe(false);
      expect(user!.bannedAt).toBeNull();
    });
  });

  describe("exportUsersCsv", () => {
    it("produces a CSV with header + rows", async () => {
      await db.user.create({ data: { id: "u1", name: "Alpha", email: "a@x.com", emailVerified: false, role: "USER" } });
      const csv = await exportUsersCsv();
      expect(csv.startsWith("id,name,email,role,banned,contributions,createdAt\n")).toBe(true);
      expect(csv).toContain("Alpha");
      expect(csv).toContain("a@x.com");
    });
  });
});
