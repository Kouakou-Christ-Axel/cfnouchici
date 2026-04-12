import { db } from "@/lib/db";
import type { ActionModeration } from "@/generated/prisma";

interface ListLogsParams {
  cursor?: string;
  limit?: number;
  action?: ActionModeration;
  moderateurId?: string;
  from?: Date;
  to?: Date;
}

export async function listLogs({
  cursor,
  limit = 50,
  action,
  moderateurId,
  from,
  to,
}: ListLogsParams = {}) {
  const where: Record<string, unknown> = {};

  if (action) where.action = action;
  if (moderateurId) where.moderateurId = moderateurId;
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  const logs = await db.logModeration.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      moderateur: { select: { id: true, name: true, image: true } },
      mot: { select: { id: true, slug: true, mot: true } },
    },
  });

  const hasMore = logs.length > limit;
  const data = hasMore ? logs.slice(0, limit) : logs;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}
