"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  FileText,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavAuthUserProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
}

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  USER: { label: "Contributeur", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  MODERATEUR: { label: "Modérateur", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function NavAuthUser({ user }: NavAuthUserProps) {
  const router = useRouter();
  const role = user.role ?? "USER";
  const isStaff = role === "MODERATEUR" || role === "ADMIN";
  const roleConfig = ROLE_LABELS[role] ?? ROLE_LABELS.USER;
  const initial = user.name?.charAt(0).toUpperCase() ?? "U";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild className="rounded-full text-sm">
        <Link href="/proposer">Proposer un mot</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-full border border-transparent p-1 pr-2",
              "hover:bg-muted hover:border-border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Menu profil"
          >
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Utilisateur"} />
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Utilisateur"} />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Badge variant="secondary" className={cn("mt-1 text-[10px] font-semibold uppercase", roleConfig.className)}>
                  {roleConfig.label}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              <span>Mon dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/proposer">
              <Plus className="size-4" />
              <span>Proposer un mot</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/propositions">
              <FileText className="size-4" />
              <span>Mes propositions</span>
            </Link>
          </DropdownMenuItem>
          {isStaff && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield className="size-4" />
                <span>Modération</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/parametres">
              <Settings className="size-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="size-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
