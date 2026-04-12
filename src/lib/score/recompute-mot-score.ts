import { db } from "@/lib/db";
import { calculatePopularityScore, type PopularityInput } from "@/lib/score/popularity";

export async function recomputeMotScore(motId: string): Promise<void> {
  const [votes, mot] = await Promise.all([
    db.voteMot.findMany({
      where: { motId },
      select: { connaissance: true, exactitude: true },
    }),
    db.mot.findUnique({
      where: { id: motId },
      select: { socialScore: true },
    }),
  ]);

  const counts: PopularityInput = {
    ouiUtilise: 0,
    connais: 0,
    jamaisEntendu: 0,
    exacte: 0,
    approximative: 0,
    fausse: 0,
    totalVotes: votes.length,
    socialScore: mot?.socialScore ?? 0,
  };

  for (const vote of votes) {
    if (vote.connaissance === "OUI_UTILISE") counts.ouiUtilise++;
    else if (vote.connaissance === "CONNAIS") counts.connais++;
    else if (vote.connaissance === "JAMAIS_ENTENDU") counts.jamaisEntendu++;

    if (vote.exactitude === "EXACTE") counts.exacte++;
    else if (vote.exactitude === "APPROXIMATIVE") counts.approximative++;
    else if (vote.exactitude === "FAUSSE") counts.fausse++;
  }

  const score = calculatePopularityScore(counts);

  await db.mot.update({
    where: { id: motId },
    data: { popularityScore: score },
  });
}
