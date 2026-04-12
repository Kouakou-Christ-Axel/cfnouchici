import { Quote } from "lucide-react";
import { categoryColor, categoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";

interface ProposerPreviewProps {
  mot: string;
  definition: string;
  categorie: string | null | undefined;
  exemples: string[];
}

export function ProposerPreview({ mot, definition, categorie, exemples }: ProposerPreviewProps) {
  const firstExample = exemples.find((e) => e.trim().length > 0);

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Aperçu
      </p>

      {categorie && (
        <span
          className={cn(
            "inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md",
            categoryColor(categorie),
          )}
        >
          {categoryLabel(categorie)}
        </span>
      )}

      <h3 className="font-(family-name:--font-heading) text-3xl font-extrabold uppercase tracking-[-0.02em]">
        {mot.trim() || "Ton mot"}
      </h3>

      <p className="text-sm text-foreground/80 leading-relaxed">
        {definition.trim() || "La définition apparaîtra ici au fur et à mesure."}
      </p>

      {firstExample && (
        <blockquote className="flex items-start gap-2 border-l-2 border-border pl-3 mt-2">
          <Quote className="size-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
          <p className="text-sm italic text-muted-foreground">{firstExample}</p>
        </blockquote>
      )}
    </div>
  );
}
