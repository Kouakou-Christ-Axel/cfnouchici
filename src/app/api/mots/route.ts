import { NextRequest, NextResponse } from "next/server";
import { listMotsValides } from "@/lib/queries/mots";
import { createMotSchema } from "@/lib/validators/mot";
import { createMot } from "@/lib/mutations/mots";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;

  const body = await request.json();
  const parsed = createMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const mot = await createMot(parsed.data, userId);
    return NextResponse.json(mot, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "SLUG_EXISTS") {
      return NextResponse.json({ error: "Ce mot existe déjà" }, { status: 409 });
    }
    throw e;
  }
}
