import { db } from "@/lib/db";

export async function getVoteSummary(motId: string) {
  const votes = await db.voteMot.findMany({ where: { motId } });

  const connaissance = { OUI_UTILISE: 0, CONNAIS: 0, JAMAIS_ENTENDU: 0 };
  const exactitude = { EXACTE: 0, APPROXIMATIVE: 0, FAUSSE: 0 };

  for (const vote of votes) {
    connaissance[vote.connaissance]++;
    exactitude[vote.exactitude]++;
  }

  return { totalVotes: votes.length, connaissance, exactitude };
}

export async function getUserVote(motId: string, userId: string) {
  return db.voteMot.findUnique({
    where: { motId_userId: { motId, userId } },
  });
}
