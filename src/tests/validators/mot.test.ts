import { describe, it, expect } from "vitest";
import { createMotSchema, updateMotSchema } from "@/lib/validators/mot";

describe("createMotSchema", () => {
  it("validates a correct payload", () => {
    const result = createMotSchema.safeParse({
      mot: "goumin",
      definition: "Se battre, se quereller.",
      categorie: "VERBE",
      exemples: ["Les deux gars ont commencé à goumin."],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty mot", () => {
    const result = createMotSchema.safeParse({
      mot: "",
      definition: "Définition",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty definition", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts without categorie (optional)", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "Définition test",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid categorie", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "Définition",
      categorie: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty exemples array", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "Définition",
      exemples: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("updateMotSchema", () => {
  it("accepts partial update (only definition)", () => {
    const result = updateMotSchema.safeParse({
      definition: "Nouvelle définition",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (only categorie)", () => {
    const result = updateMotSchema.safeParse({
      categorie: "NOM",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateMotSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
