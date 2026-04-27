"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PopularityBadge } from "@/components/dashboard/moderation/popularity-badge";
import { RejectDialog } from "@/components/dashboard/moderation/reject-dialog";
import { categoryLabel, categoryColor } from "@/lib/category";
import { cn } from "@/lib/utils";

interface PendingItemProps {
  slug: string;
  mot: string;
  definition: string;
  categorie: string | null;
  popularityScore: number;
  createdAt: Date;
  authorName: string | null;
  voteCount: number;
}

export function PendingItem({
  slug,
  mot,
  definition,
  categorie,
  popularityScore,
  createdAt,
  authorName,
  voteCount,
}: PendingItemProps) {
  const router = useRouter();

  async function handleValidate() {
    const res = await fetch(`/api/admin/mots/${slug}/valider`, { method: "POST" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-(family-name:--font-heading) font-bold uppercase">{mot}</span>
          {categorie && (
            <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md", categoryColor(categorie))}>
              {categoryLabel(categorie)}
            </span>
          )}
          <PopularityBadge score={popularityScore} />
        </div>
        <p className="text-sm text-muted-foreground truncate">{definition}</p>
        <p className="text-xs text-muted-foreground">
          par {authorName ?? "—"} · {formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })} · {voteCount} votes
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/moderation/${slug}`}>
            <ExternalLink className="size-3.5 mr-1" />
            Examiner
          </Link>
        </Button>
        <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleValidate}>
          <Check className="size-3.5" />
          Valider
        </Button>
        <RejectDialog slug={slug} mot={mot} />
      </div>
    </div>
  );
}
