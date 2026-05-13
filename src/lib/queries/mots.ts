import { db } from "@/lib/db";
import type { Categorie } from "@/generated/prisma";

interface ListMotsParams {
  cursor?: string;
  limit?: number;
  search?: string;
  lettre?: string;
  categorie?: Categorie;
}

const sensInclude = {
  orderBy: { ordre: "asc" as const },
  include: { exemples: true },
};

export async function listMotsValides({
  cursor,
  limit = 20,
  search,
  lettre,
  categorie,
}: ListMotsParams = {}) {
  const where: Record<string, unknown> = { statut: "VALIDE" };

  if (lettre) {
    where.mot = { startsWith: lettre, mode: "insensitive" };
  }

  if (categorie) {
    where.sens = { some: { categorie } };
  }

  if (search) {
    where.OR = [
      { mot: { search } },
      { sens: { some: { definition: { search } } } },
    ];
  }

  const mots = await db.mot.findMany({
    where,
    include: { sens: sensInclude, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { mot: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = mots.length > limit;
  const data = hasMore ? mots.slice(0, limit) : mots;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}

export async function getMotBySlug(slug: string) {
  return db.mot.findUnique({
    where: { slug },
    include: { sens: sensInclude, soumisPar: { select: { id: true, name: true, image: true } } },
  });
}

export async function listAllMotsValides() {
  return db.mot.findMany({
    where: { statut: "VALIDE" },
    include: { sens: sensInclude, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { mot: "asc" },
  });
}

export async function listMotsValidesByLettre(lettre: string) {
  return db.mot.findMany({
    where: {
      statut: "VALIDE",
      mot: { startsWith: lettre, mode: "insensitive" },
    },
    include: { sens: sensInclude, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { mot: "asc" },
  });
}

export async function getPopularMots(limit = 6) {
  return db.mot.findMany({
    where: { statut: "VALIDE" },
    include: { sens: sensInclude, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function getRecentMots(limit = 6) {
  return db.mot.findMany({
    where: { statut: "VALIDE" },
    include: { sens: sensInclude, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
