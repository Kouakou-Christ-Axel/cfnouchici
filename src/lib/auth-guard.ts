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
    const role = (session!.user as { role?: string }).role ?? "USER";
    if (role !== "MODERATEUR" && role !== "ADMIN") {
      redirect("/");
    }
  }

  return session!;
}
