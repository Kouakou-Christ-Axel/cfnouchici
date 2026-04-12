"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface SocialScoreBlockProps {
  slug: string;
  initialScore: number;
  initialNotes: string | null;
}

export function SocialScoreBlock({ slug, initialScore, initialNotes }: SocialScoreBlockProps) {
  const [score, setScore] = useState(initialScore);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/admin/mots/${slug}/social`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialScore: score, socialNotes: notes || null }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("Score social enregistré. Popularité recalculée.");
      router.refresh();
    } else {
      setMessage("Erreur lors de l'enregistrement.");
    }
  }

  const dirty = score !== initialScore || (notes || "") !== (initialNotes ?? "");

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <h3 className="font-(family-name:--font-heading) font-bold tracking-tight">
            Popularité réseaux sociaux
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Si tu as vu ce mot sur TikTok / Instagram / Twitter, ajuste le score ci-dessous. Il influe directement sur le classement.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Score social : <span className="font-bold text-foreground">{score}/10</span></Label>
          </div>
          <Slider
            value={[score]}
            onValueChange={(v) => setScore(v[0])}
            min={0}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
            <span>Invisible</span>
            <span>Viral</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: 3 vidéos TikTok + 1.2M vues sur le hashtag #nouchi"
            rows={2}
            maxLength={500}
          />
        </div>

        {message && <p className="text-xs text-emerald-600">{message}</p>}

        <Button onClick={handleSave} disabled={loading || !dirty} className="rounded-full">
          {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
          Enregistrer le score social
        </Button>
      </CardContent>
    </Card>
  );
}
