import { NextRequest, NextResponse } from "next/server";
import { listMotsValides } from "@/lib/queries/mots";
import type { Categorie } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const search = searchParams.get("search") ?? undefined;
  const lettre = searchParams.get("lettre") ?? undefined;
  const categorie = (searchParams.get("categorie") as Categorie) ?? undefined;

  const result = await listMotsValides({ cursor, limit, search, lettre, categorie });
  return NextResponse.json(result);
}

export async function POST() {
  // Will be wired in Task 7
  return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
}
