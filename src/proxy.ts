import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Pure function — testable
type UserInfo = { id: string; role: string } | null;

type AccessResult =
  | { allowed: true }
  | { allowed: false; redirect: string };

export function checkRouteAccess(pathname: string, user: UserInfo): AccessResult {
  const isProtected = pathname === "/proposer" || pathname.startsWith("/proposer/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isProtected && !isAdmin) {
    return { allowed: true };
  }

  if (!user) {
    return { allowed: false, redirect: `/connexion?callbackUrl=${pathname}` };
  }

  if (isAdmin && user.role !== "MODERATEUR" && user.role !== "ADMIN") {
    return { allowed: false, redirect: "/" };
  }

  return { allowed: true };
}

// Next.js 16 proxy function
export function proxy(_request: NextRequest) {
  // For now, route protection is handled at the page level via getSessionOrRedirect
  // This proxy satisfies Next.js 16's requirement for the file export
  return NextResponse.next();
}
