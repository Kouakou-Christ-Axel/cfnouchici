import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { updateSocialScore } from "@/lib/mutations/social-score";

describe("updateSocialScore", () => {
  let slug: string;

  beforeEach(async () => {
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
    const mot = await db.mot.create({
      data: { slug: "social-test", mot: "SocialTest", statut: "EN_ATTENTE" },
    });
    slug = mot.slug;
  });

  it("updates socialScore and recomputes popularityScore", async () => {
    await updateSocialScore(slug, { socialScore: 7, socialNotes: "Vu sur TikTok" });
    const mot = await db.mot.findUnique({ where: { slug } });
    expect(mot!.socialScore).toBe(7);
    expect(mot!.socialNotes).toBe("Vu sur TikTok");
    // 7 × 3 = 21 via SOCIAL_MULTIPLIER
    expect(mot!.popularityScore).toBe(21);
  });

  it("accepts null notes", async () => {
    await updateSocialScore(slug, { socialScore: 3, socialNotes: null });
    const mot = await db.mot.findUnique({ where: { slug } });
    expect(mot!.socialNotes).toBeNull();
  });
});
