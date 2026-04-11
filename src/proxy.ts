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

// Server-side helper — used in page server components
// This function uses Next.js server imports, so it can't be unit tested directly
export async function getSessionOrRedirect(pathname: string, requireRole?: "MODERATEUR" | "ADMIN") {
  const { auth } = await import("@/lib/auth");
  const { headers } = await import("next/headers");
  const { redirect } = await import("next/navigation");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/connexion?callbackUrl=${pathname}`);
  }

  if (requireRole) {
    const role = (session.user as { role?: string }).role ?? "USER";
    if (role !== "MODERATEUR" && role !== "ADMIN") {
      redirect("/");
    }
  }

  return session;
}
