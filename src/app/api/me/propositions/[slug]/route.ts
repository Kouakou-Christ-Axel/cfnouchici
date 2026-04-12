import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteMyProposition } from "@/lib/mutations/me";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { slug } = await params;
  try {
    await deleteMyProposition(session.user.id, slug);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
      if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      if (e.message === "NOT_PENDING") return NextResponse.json({ error: "Mot déjà traité" }, { status: 409 });
    }
    throw e;
  }
}
