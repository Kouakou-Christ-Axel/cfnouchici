import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryColor, categoryLabel } from "@/lib/category";

interface WordCardProps {
  slug: string;
  mot: string;
  definition: string;
  categorie: string | null;
  authorName: string | null;
}

export function WordCard({ slug, mot, definition, categorie, authorName }: WordCardProps) {
  return (
    <Link href={`/mots/${slug}`}>
      <div className="group block bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md inline-block",
            categoryColor(categorie)
          )}
        >
          {categoryLabel(categorie)}
        </span>

        <p className="font-[family-name:var(--font-heading)] text-xl font-extrabold uppercase tracking-tight mt-2.5">
          {mot}
        </p>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {definition}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            par <strong>{authorName}</strong>
          </span>
          <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
