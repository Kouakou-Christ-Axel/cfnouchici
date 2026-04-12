"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban, UserCheck, Loader2 } from "lucide-react";

interface BanUserDialogProps {
  userId: string;
  userName: string;
  banned: boolean;
}

export function BanUserDialog({ userId, userName, banned }: BanUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: !banned }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={banned ? "Débannir" : "Bannir"}>
          {banned ? <UserCheck className="size-4 text-emerald-600" /> : <Ban className="size-4 text-red-600" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{banned ? "Débannir" : "Bannir"} {userName}</DialogTitle>
          <DialogDescription>
            {banned
              ? "L'utilisateur pourra à nouveau se connecter et contribuer."
              : "L'utilisateur ne pourra plus se connecter ni contribuer."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant={banned ? "default" : "destructive"} onClick={handleAction} disabled={loading}>
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {banned ? "Débannir" : "Bannir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
