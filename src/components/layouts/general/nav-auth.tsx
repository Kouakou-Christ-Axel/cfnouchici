"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function NavAuth() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const role = (user as { role?: string } | undefined)?.role;
  const isModerator = role === "MODERATEUR" || role === "ADMIN";

  if (!user) {
    return (
      <div className={cn("flex items-center gap-3")}>
        <Link
          href="/connexion"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Se connecter
        </Link>
        <Button asChild className="rounded-full text-sm">
          <Link href="/proposer">Proposer un mot</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3")}>
      {isModerator && (
        <Button variant="ghost" size="icon" asChild aria-label="Administration">
          <Link href="/admin">
            <Shield className="size-4" />
          </Link>
        </Button>
      )}
      <Avatar className="size-8">
        <AvatarImage
          src={user.image ?? undefined}
          alt={user.name ?? "Utilisateur"}
        />
        <AvatarFallback>
          {user.name?.charAt(0).toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        aria-label="Se déconnecter"
      >
        <LogOut className="size-4" />
      </Button>
      <Button asChild className="rounded-full text-sm">
        <Link href="/proposer">Proposer un mot</Link>
      </Button>
    </div>
  );
}
