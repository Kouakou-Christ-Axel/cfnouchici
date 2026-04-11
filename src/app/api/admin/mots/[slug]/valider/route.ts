import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { validerMot } from "@/lib/mutations/moderation";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const result = await validerMot(slug, session!.user.id);
  return NextResponse.json(result);
}
