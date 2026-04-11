import { describe, it, expect } from "vitest";
import { defineAbilitiesFor } from "@/lib/casl/abilities";

const makeUser = (role: "USER" | "MODERATEUR" | "ADMIN", id = "user-1") => ({ id, role });

describe("CASL abilities", () => {
  describe("USER", () => {
    const abilities = defineAbilitiesFor(makeUser("USER"));

    it("can read VALIDE words", () => {
      expect(abilities.can("read", "Mot", { statut: "VALIDE" })).toBe(true);
    });

    it("cannot read EN_ATTENTE words from others", () => {
      expect(abilities.can("read", "Mot", { statut: "EN_ATTENTE", soumisParId: "other" })).toBe(false);
    });

    it("can create a word", () => {
      expect(abilities.can("create", "Mot")).toBe(true);
    });

    it("can update own EN_ATTENTE word", () => {
      expect(abilities.can("update", "Mot", { soumisParId: "user-1", statut: "EN_ATTENTE" })).toBe(true);
    });

    it("cannot update someone else's word", () => {
      expect(abilities.can("update", "Mot", { soumisParId: "other", statut: "EN_ATTENTE" })).toBe(false);
    });

    it("cannot update a VALIDE word", () => {
      expect(abilities.can("update", "Mot", { soumisParId: "user-1", statut: "VALIDE" })).toBe(false);
    });

    it("cannot moderate", () => {
      expect(abilities.can("moderate", "Mot")).toBe(false);
    });
  });

  describe("MODERATEUR", () => {
    const abilities = defineAbilitiesFor(makeUser("MODERATEUR"));

    it("can read all words regardless of statut", () => {
      expect(abilities.can("read", "Mot", { statut: "EN_ATTENTE" })).toBe(true);
      expect(abilities.can("read", "Mot", { statut: "VALIDE" })).toBe(true);
      expect(abilities.can("read", "Mot", { statut: "REJETE" })).toBe(true);
    });

    it("can moderate words", () => {
      expect(abilities.can("moderate", "Mot")).toBe(true);
    });

    it("can create a word", () => {
      expect(abilities.can("create", "Mot")).toBe(true);
    });
  });

  describe("ADMIN", () => {
    const abilities = defineAbilitiesFor(makeUser("ADMIN"));

    it("can manage everything", () => {
      expect(abilities.can("manage", "all")).toBe(true);
    });
  });

  describe("unauthenticated (null user)", () => {
    const abilities = defineAbilitiesFor(null);

    it("can read VALIDE words", () => {
      expect(abilities.can("read", "Mot", { statut: "VALIDE" })).toBe(true);
    });

    it("cannot create", () => {
      expect(abilities.can("create", "Mot")).toBe(false);
    });

    it("cannot moderate", () => {
      expect(abilities.can("moderate", "Mot")).toBe(false);
    });
  });
});
