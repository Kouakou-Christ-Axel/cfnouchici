import { NextRequest, NextResponse } from "next/server";
import { getMotBySlug } from "@/lib/queries/mots";
import { updateMotSchema } from "@/lib/validators/mot";
import { updateMot, deleteMot } from "@/lib/mutations/mots";
import { defineAbilitiesFor } from "@/lib/casl/abilities";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const mot = await getMotBySlug(slug);

  if (!mot || mot.statut !== "VALIDE") {
    return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
  }

  return NextResponse.json(mot);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) {
    return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
  }

  const user = session.user as { id: string; role?: string };
  const abilities = defineAbilitiesFor({ id: user.id, role: (user.role ?? "USER") as "USER" | "MODERATEUR" | "ADMIN" });
  if (!abilities.can("update", "Mot", { soumisParId: mot.soumisParId, statut: mot.statut })) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateMot(slug, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) {
    return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
  }

  const user = session.user as { id: string; role?: string };
  const abilities = defineAbilitiesFor({ id: user.id, role: (user.role ?? "USER") as "USER" | "MODERATEUR" | "ADMIN" });
  if (!abilities.can("update", "Mot", { soumisParId: mot.soumisParId, statut: mot.statut })) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await deleteMot(slug);
  return NextResponse.json({ success: true });
}
