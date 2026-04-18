import { NextRequest, NextResponse } from "next/server";
import { searchMots } from "@/lib/queries/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ data: [] });
  }
  const results = await searchMots(q);
  return NextResponse.json({ data: results });
}
