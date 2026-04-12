import { db } from "@/lib/db";
import { recomputeMotScore } from "@/lib/score/recompute-mot-score";
import type { VoteMotInput } from "@/lib/validators/vote";

export async function upsertVote(motId: string, userId: string, input: VoteMotInput) {
  const vote = await db.voteMot.upsert({
    where: { motId_userId: { motId, userId } },
    create: {
      motId,
      userId,
      connaissance: input.connaissance,
      exactitude: input.exactitude,
    },
    update: {
      connaissance: input.connaissance,
      exactitude: input.exactitude,
    },
  });

  await recomputeMotScore(motId);

  return vote;
}
