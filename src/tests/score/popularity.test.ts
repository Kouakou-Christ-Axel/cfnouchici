import { describe, it, expect } from "vitest";
import {
  calculatePopularityScore,
  applyTemporalBoost,
  POPULARITY_WEIGHTS,
} from "@/lib/score/popularity";

const emptyInput = {
  ouiUtilise: 0,
  connais: 0,
  jamaisEntendu: 0,
  exacte: 0,
  approximative: 0,
  fausse: 0,
  totalVotes: 0,
  socialScore: 0,
};

describe("calculatePopularityScore", () => {
  it("returns 0 for all-zero input", () => {
    expect(calculatePopularityScore(emptyInput)).toBe(0);
  });

  it("weights OUI_UTILISE at 3x", () => {
    const score = calculatePopularityScore({ ...emptyInput, ouiUtilise: 10, totalVotes: 10 });
    expect(score).toBeGreaterThan(30);
    expect(score).toBeLessThan(36);
  });

  it("penalizes JAMAIS_ENTENDU at -2x", () => {
    const score = calculatePopularityScore({ ...emptyInput, jamaisEntendu: 5, totalVotes: 5 });
    expect(score).toBeLessThan(-6);
    expect(score).toBeGreaterThan(-8);
  });

  it("penalizes FAUSSE at -2x", () => {
    const score = calculatePopularityScore({ ...emptyInput, fausse: 3, totalVotes: 3 });
    expect(score).toBeLessThan(-3);
  });

  it("applies social score with high multiplier", () => {
    const score = calculatePopularityScore({ ...emptyInput, socialScore: 5 });
    expect(score).toBe(5 * POPULARITY_WEIGHTS.SOCIAL_MULTIPLIER);
  });

  it("boosts engagement logarithmically", () => {
    const low = calculatePopularityScore({ ...emptyInput, totalVotes: 1 });
    const high = calculatePopularityScore({ ...emptyInput, totalVotes: 100 });
    expect(high).toBeGreaterThan(low);
  });

  it("combines all factors correctly", () => {
    const score = calculatePopularityScore({
      ouiUtilise: 10,
      connais: 5,
      jamaisEntendu: 2,
      exacte: 8,
      approximative: 3,
      fausse: 1,
      totalVotes: 29,
      socialScore: 7,
    });
    expect(score).toBeGreaterThan(72);
    expect(score).toBeLessThan(74);
  });
});

describe("applyTemporalBoost", () => {
  it("returns stored score when createdAt is now", () => {
    const now = new Date("2026-04-12T12:00:00Z");
    expect(applyTemporalBoost(10, now, now)).toBe(10);
  });

  it("boosts score by days pending", () => {
    const now = new Date("2026-04-12T12:00:00Z");
    const tenDaysAgo = new Date("2026-04-02T12:00:00Z");
    expect(applyTemporalBoost(10, tenDaysAgo, now)).toBeCloseTo(15, 1);
  });

  it("never decreases the score", () => {
    const now = new Date("2026-04-12T12:00:00Z");
    const past = new Date("2026-01-01T12:00:00Z");
    const boosted = applyTemporalBoost(10, past, now);
    expect(boosted).toBeGreaterThan(10);
  });
});
