import { NextRequest, NextResponse } from "next/server";
import { getAdminOnlySession } from "@/lib/auth-helpers";
import { listUsers } from "@/lib/queries/users";
import type { Role } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await getAdminOnlySession();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const search = searchParams.get("search") ?? undefined;
  const role = (searchParams.get("role") as Role) ?? undefined;
  const sort = (searchParams.get("sort") as "recent" | "oldest" | "contributions" | "name") ?? undefined;

  const result = await listUsers({ cursor, limit, search, role, sort });
  return NextResponse.json(result);
}
