"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";

interface RejectDialogProps {
  slug: string;
  mot: string;
}

export function RejectDialog({ slug, mot }: RejectDialogProps) {
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReject() {
    if (!motif.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/mots/${slug}/rejeter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motif }),
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
        <Button variant="outline" size="sm" className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
          <X className="size-3.5" />
          Rejeter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter &quot;{mot}&quot;</DialogTitle>
          <DialogDescription>
            Indique pourquoi ce mot est rejeté. Le message sera visible par le contributeur.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="motif">Motif</Label>
          <Textarea id="motif" value={motif} onChange={(e) => setMotif(e.target.value)} rows={3} required />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading || !motif.trim()}>
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Rejeter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
