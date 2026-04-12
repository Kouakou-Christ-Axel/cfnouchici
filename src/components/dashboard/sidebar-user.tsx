"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SidebarUserProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
}

const ROLE_META: Record<string, { label: string; className: string }> = {
  USER: { label: "Contributeur", className: "bg-purple-100 text-purple-700" },
  MODERATEUR: { label: "Modérateur", className: "bg-blue-100 text-blue-700" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
};

export function SidebarUser({ user }: SidebarUserProps) {
  const router = useRouter();
  const role = user.role ?? "USER";
  const meta = ROLE_META[role] ?? ROLE_META.USER;
  const initial = user.name?.charAt(0).toUpperCase() ?? "U";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 p-3 border-t border-sidebar-border">
      <Avatar className="size-9">
        <AvatarImage src={user.image ?? undefined} alt={user.name} />
        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-semibold">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{user.name}</p>
        <Badge variant="secondary" className={cn("text-[10px] font-semibold uppercase", meta.className)}>
          {meta.label}
        </Badge>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Se déconnecter">
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
