import { db } from "@/lib/db";
import { recomputeMotScore } from "@/lib/score/recompute-mot-score";
import type { UpdateSocialScoreInput } from "@/lib/validators/social-score";

export async function updateSocialScore(slug: string, input: UpdateSocialScoreInput) {
  const mot = await db.mot.update({
    where: { slug },
    data: {
      socialScore: input.socialScore,
      socialNotes: input.socialNotes ?? null,
    },
  });

  await recomputeMotScore(mot.id);

  return db.mot.findUnique({ where: { id: mot.id } });
}
