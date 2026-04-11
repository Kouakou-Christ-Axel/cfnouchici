"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categoryColor, categoryLabel } from "@/lib/category";

interface MotPreviewProps {
  mot: string;
  definition: string;
  categorie?: string;
  exemples?: string[];
}

export function MotPreview({ mot, definition, categorie, exemples }: MotPreviewProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aperçu</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          {categorie && (
            <Badge className={`text-xs ${categoryColor(categorie)}`} variant="outline">
              {categoryLabel(categorie)}
            </Badge>
          )}
          <h2 className="text-2xl font-bold tracking-tight">
            {mot || <span className="text-muted-foreground italic">Mot...</span>}
          </h2>
        </div>

        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {definition || <span className="italic">Définition...</span>}
          </p>
        </div>

        {exemples && exemples.filter(Boolean).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemples</p>
            <ul className="space-y-1">
              {exemples.filter(Boolean).map((ex, i) => (
                <li key={i} className="text-sm italic text-muted-foreground pl-3 border-l-2 border-muted">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
