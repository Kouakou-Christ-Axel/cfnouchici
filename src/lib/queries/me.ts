import { db } from "@/lib/db";
import type { Statut } from "@/generated/prisma";

interface ListMyPropositionsParams {
  statut?: Statut;
  search?: string;
  cursor?: string;
  limit?: number;
}

export async function getMyStats(userId: string) {
  const [total, validated, pending, rejected, oldestPending, recentPropositions] = await Promise.all([
    db.mot.count({ where: { soumisParId: userId } }),
    db.mot.count({ where: { soumisParId: userId, statut: "VALIDE" } }),
    db.mot.count({ where: { soumisParId: userId, statut: "EN_ATTENTE" } }),
    db.mot.count({ where: { soumisParId: userId, statut: "REJETE" } }),
    db.mot.findFirst({
      where: { soumisParId: userId, statut: "EN_ATTENTE" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    db.mot.findMany({
      where: { soumisParId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        mot: true,
        definition: true,
        categorie: true,
        statut: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    total,
    validated,
    pending,
    rejected,
    oldestPendingAt: oldestPending?.createdAt ?? null,
    recentPropositions,
  };
}

export async function listMyPropositions(userId: string, params: ListMyPropositionsParams = {}) {
  const { statut, search, cursor, limit = 20 } = params;
  const where: Record<string, unknown> = { soumisParId: userId };

  if (statut) where.statut = statut;
  if (search) {
    where.OR = [
      { mot: { contains: search, mode: "insensitive" } },
      { definition: { contains: search, mode: "insensitive" } },
    ];
  }

  const mots = await db.mot.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = mots.length > limit;
  const data = hasMore ? mots.slice(0, limit) : mots;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}
