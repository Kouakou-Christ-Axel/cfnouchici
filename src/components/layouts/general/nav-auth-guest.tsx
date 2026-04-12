import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavAuthGuest() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/connexion"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Se connecter
      </Link>
      <Button asChild className="rounded-full text-sm">
        <Link href="/connexion">Proposer un mot</Link>
      </Button>
    </div>
  );
}
