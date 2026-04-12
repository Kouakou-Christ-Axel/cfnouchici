import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { updateSocialScore } from "@/lib/mutations/social-score";
import { updateSocialScoreSchema } from "@/lib/validators/social-score";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const body = await request.json();
  const parsed = updateSocialScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await updateSocialScore(slug, parsed.data);
  return NextResponse.json(result);
}
