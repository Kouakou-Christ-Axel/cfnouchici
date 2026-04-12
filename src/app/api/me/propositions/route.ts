import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { listMyPropositions } from "@/lib/queries/me";
import type { Statut } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const statut = (searchParams.get("statut") as Statut) ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const result = await listMyPropositions(session.user.id, { statut, search, cursor, limit });
  return NextResponse.json(result);
}
