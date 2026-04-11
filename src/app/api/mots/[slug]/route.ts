import { NextRequest, NextResponse } from "next/server";
import { getMotBySlug } from "@/lib/queries/mots";

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
