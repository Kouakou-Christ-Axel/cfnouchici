import { NextRequest, NextResponse } from "next/server";
import { getAdminOnlySession } from "@/lib/auth-helpers";
import { updateUser } from "@/lib/mutations/users";
import { updateUserSchema } from "@/lib/validators/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAdminOnlySession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await updateUser(id, parsed.data);
  return NextResponse.json(user);
}
