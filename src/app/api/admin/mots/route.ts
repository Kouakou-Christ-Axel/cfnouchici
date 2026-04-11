import { NextRequest, NextResponse } from "next/server";
import { listAllMots } from "@/lib/queries/admin";
import { getAdminSession } from "@/lib/auth-helpers";
import type { Statut, Categorie } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await getAdminSession();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const statut = (searchParams.get("statut") as Statut) ?? undefined;
  const categorie = (searchParams.get("categorie") as Categorie) ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const result = await listAllMots({ cursor, limit, statut, categorie, search });
  return NextResponse.json(result);
}
