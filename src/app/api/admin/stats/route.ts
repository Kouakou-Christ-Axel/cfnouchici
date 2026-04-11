import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { getAdminStats } from "@/lib/queries/admin";

export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
