import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { rejeterMot } from "@/lib/mutations/moderation";
import { rejeterMotSchema } from "@/lib/validators/moderation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const body = await request.json();
  const parsed = rejeterMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await rejeterMot(slug, session!.user.id, parsed.data.motif);
  return NextResponse.json(result);
}
