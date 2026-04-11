import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { getMotBySlug } from "@/lib/queries/mots";
import { updateMotSchema } from "@/lib/validators/mot";
import { editerMotAdmin } from "@/lib/mutations/moderation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });

  return NextResponse.json(mot);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const body = await request.json();
  const parsed = updateMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await editerMotAdmin(slug, parsed.data, session!.user.id);
  return NextResponse.json(result);
}
