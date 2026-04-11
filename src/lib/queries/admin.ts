import { db } from "@/lib/db";
import type { Statut, Categorie } from "@/generated/prisma";

interface ListAllMotsParams {
  cursor?: string;
  limit?: number;
  statut?: Statut;
  categorie?: Categorie;
  search?: string;
}

export async function listAllMots({
  cursor,
  limit = 20,
  statut,
  categorie,
  search,
}: ListAllMotsParams = {}) {
  const where: Record<string, unknown> = {};

  if (statut) where.statut = statut;
  if (categorie) where.categorie = categorie;
  if (search) {
    where.OR = [
      { mot: { contains: search, mode: "insensitive" } },
      { definition: { contains: search, mode: "insensitive" } },
    ];
  }

  const mots = await db.mot.findMany({
    where,
    include: {
      exemples: true,
      soumisPar: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = mots.length > limit;
  const data = hasMore ? mots.slice(0, limit) : mots;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}

export async function getMotStats(motId: string) {
  const votes = await db.voteMot.findMany({ where: { motId } });

  const connaissance = { OUI_UTILISE: 0, CONNAIS: 0, JAMAIS_ENTENDU: 0 };
  const exactitude = { EXACTE: 0, APPROXIMATIVE: 0, FAUSSE: 0 };

  for (const vote of votes) {
    connaissance[vote.connaissance]++;
    exactitude[vote.exactitude]++;
  }

  return { totalVotes: votes.length, connaissance, exactitude };
}

export async function getAdminStats() {
  const [enAttente, valide, rejete, totalContributions, logsThisWeek] = await Promise.all([
    db.mot.count({ where: { statut: "EN_ATTENTE" } }),
    db.mot.count({ where: { statut: "VALIDE" } }),
    db.mot.count({ where: { statut: "REJETE" } }),
    db.mot.count(),
    db.logModeration.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      include: { moderateur: { select: { id: true, name: true } } },
    }),
  ]);

  const moderateursActifs = new Set(logsThisWeek.map((l) => l.moderateurId)).size;

  const parModerateur: Record<string, { name: string; count: number }> = {};
  for (const log of logsThisWeek) {
    if (!parModerateur[log.moderateurId]) {
      parModerateur[log.moderateurId] = { name: log.moderateur.name, count: 0 };
    }
    parModerateur[log.moderateurId].count++;
  }

  return {
    parStatut: { EN_ATTENTE: enAttente, VALIDE: valide, REJETE: rejete },
    totalContributions,
    moderateursActifs,
    parModerateur,
    actionsThisWeek: logsThisWeek.length,
  };
}
