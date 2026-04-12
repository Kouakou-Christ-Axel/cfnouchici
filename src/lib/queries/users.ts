import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma";

export type UsersSortOption = "recent" | "oldest" | "contributions" | "name";

interface ListUsersParams {
  cursor?: string;
  limit?: number;
  search?: string;
  role?: Role;
  sort?: UsersSortOption;
}

export async function listUsers({
  cursor,
  limit = 20,
  search,
  role,
  sort = "recent",
}: ListUsersParams = {}) {
  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderByMap = {
    recent: { createdAt: "desc" as const },
    oldest: { createdAt: "asc" as const },
    contributions: { motsSoumis: { _count: "desc" as const } },
    name: { name: "asc" as const },
  };

  const users = await db.user.findMany({
    where,
    orderBy: orderByMap[sort],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { _count: { select: { motsSoumis: true } } },
  });

  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}

export async function exportUsersCsv(): Promise<string> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { motsSoumis: true } } },
  });

  const header = "id,name,email,role,banned,contributions,createdAt\n";
  const rows = users.map((u) => {
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      u.id,
      escape(u.name),
      escape(u.email),
      u.role,
      u.banned,
      u._count.motsSoumis,
      u.createdAt.toISOString(),
    ].join(",");
  }).join("\n");

  return header + rows;
}
