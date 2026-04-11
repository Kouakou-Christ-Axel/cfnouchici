import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMotBySlug } from "@/lib/queries/mots";
import { voteMotSchema } from "@/lib/validators/vote";
import { upsertVote } from "@/lib/mutations/votes";
import { getVoteSummary } from "@/lib/queries/votes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });

  const summary = await getVoteSummary(mot.id);
  return NextResponse.json(summary);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });

  const body = await request.json();
  const parsed = voteMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const vote = await upsertVote(mot.id, session.user.id, parsed.data);
  return NextResponse.json(vote, { status: 201 });
}
