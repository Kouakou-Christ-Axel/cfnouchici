"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
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

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const meta = ROLE_META[user.role ?? "USER"] ?? ROLE_META.USER;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage({ type: "success", text: "Profil mis à jour." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour." });
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.email}</p>
            <Badge variant="secondary" className={cn("mt-1 text-[10px] uppercase", meta.className)}>
              {meta.label}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom d&apos;affichage</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={60}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ce nom sera visible par les autres utilisateurs sur tes propositions.
            </p>
          </div>

          {message && (
            <p className={cn("text-sm", message.type === "success" ? "text-emerald-600" : "text-destructive")}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={loading || name === user.name} className="rounded-full">
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
