import { describe, it, expect } from "vitest";
import { rejeterMotSchema, validerMotSchema } from "@/lib/validators/moderation";

describe("rejeterMotSchema", () => {
  it("validates with a motif", () => {
    const result = rejeterMotSchema.safeParse({ motif: "Définition incorrecte" });
    expect(result.success).toBe(true);
  });

  it("rejects empty motif", () => {
    const result = rejeterMotSchema.safeParse({ motif: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing motif", () => {
    const result = rejeterMotSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("validerMotSchema", () => {
  it("accepts empty body", () => {
    const result = validerMotSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
