import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { categoryLabel } from "@/lib/category";

interface RecentWordRowProps {
  slug: string;
  mot: string;
  definition: string | null;
  categorie: string | null;
  authorName: string | null;
  createdAt: Date;
  index: number;
}

export function RecentWordRow({
  slug,
  mot,
  definition,
  categorie,
  authorName,
  createdAt,
  index,
}: RecentWordRowProps) {
  return (
    <Link
      href={`/mots/${slug}`}
      className="group flex items-center justify-between gap-4 py-4 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
    >
      {/* Left side */}
      <div className="flex items-center gap-5 min-w-0">
        {/* Index */}
        <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Word info column */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold uppercase tracking-tight group-hover:underline underline-offset-4">
              {mot}
            </span>
            {categorie && (
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 hidden sm:inline">
                {categoryLabel(categorie)}
              </span>
            )}
          </div>
          {definition && (
            <span className="text-sm text-muted-foreground truncate">
              {definition}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Date column */}
        <div className="hidden md:flex flex-col items-end gap-0.5">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })}
          </span>
          <span className="text-xs text-muted-foreground">
            {authorName ?? "—"}
          </span>
        </div>

        {/* Arrow icon */}
        <ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </div>
    </Link>
  );
}
