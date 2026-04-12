import { NextRequest, NextResponse } from "next/server";
import { getAdminOnlySession } from "@/lib/auth-helpers";
import { listLogs } from "@/lib/queries/logs";
import type { ActionModeration } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await getAdminOnlySession();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
  const action = (searchParams.get("action") as ActionModeration) ?? undefined;
  const moderateurId = searchParams.get("moderateurId") ?? undefined;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : undefined;
  const to = toStr ? new Date(toStr) : undefined;

  const result = await listLogs({ cursor, limit, action, moderateurId, from, to });
  return NextResponse.json(result);
}
