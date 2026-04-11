import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }), session: null };
  }

  const role = (session.user as { role?: string }).role ?? "USER";
  if (role !== "MODERATEUR" && role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}
