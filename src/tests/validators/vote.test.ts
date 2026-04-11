import { describe, it, expect } from "vitest";
import { voteMotSchema } from "@/lib/validators/vote";

describe("voteMotSchema", () => {
  it("validates correct vote", () => {
    const result = voteMotSchema.safeParse({
      connaissance: "OUI_UTILISE",
      exactitude: "EXACTE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid connaissance", () => {
    const result = voteMotSchema.safeParse({
      connaissance: "INVALID",
      exactitude: "EXACTE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = voteMotSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts all valid connaissance values", () => {
    for (const value of ["OUI_UTILISE", "CONNAIS", "JAMAIS_ENTENDU"]) {
      const result = voteMotSchema.safeParse({ connaissance: value, exactitude: "EXACTE" });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid exactitude values", () => {
    for (const value of ["EXACTE", "APPROXIMATIVE", "FAUSSE"]) {
      const result = voteMotSchema.safeParse({ connaissance: "OUI_UTILISE", exactitude: value });
      expect(result.success).toBe(true);
    }
  });
});
