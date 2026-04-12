"use client";

import { authClient } from "@/lib/auth-client";
import { NavAuthGuest } from "@/components/layouts/general/nav-auth-guest";
import { NavAuthUser } from "@/components/layouts/general/nav-auth-user";

export function NavAuth() {
  const { data: session } = authClient.useSession();
  const user = session?.user as
    | { id: string; name: string; email: string; image?: string | null; role?: string }
    | undefined;

  if (!user) return <NavAuthGuest />;
  return <NavAuthUser user={user} />;
}
