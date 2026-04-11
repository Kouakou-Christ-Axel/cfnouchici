import { db } from "@/lib/db";
import type { VoteMotInput } from "@/lib/validators/vote";

export async function upsertVote(motId: string, userId: string, input: VoteMotInput) {
  return db.voteMot.upsert({
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
}
