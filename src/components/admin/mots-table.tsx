"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryColor, categoryLabel } from "@/lib/category";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Loader2 } from "lucide-react";

type Statut = "EN_ATTENTE" | "VALIDE" | "REJETE";

interface Mot {
  id: string;
  slug: string;
  mot: string;
  categorie: string | null;
  statut: string;
  createdAt: string;
  soumisPar: { id: string; name: string; image: string | null } | null;
  _count: { votes: number };
}

const TABS: { label: string; value: Statut | "TOUS" }[] = [
  { label: "Tous", value: "TOUS" },
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Validés", value: "VALIDE" },
  { label: "Rejetés", value: "REJETE" },
];

const STATUT_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  EN_ATTENTE: { label: "En attente", variant: "outline" },
  VALIDE: { label: "Validé", variant: "default" },
  REJETE: { label: "Rejeté", variant: "destructive" },
};

export function MotsTable() {
  const [statut, setStatut] = useState<Statut | "TOUS">("TOUS");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mots, setMots] = useState<Mot[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchMots = useCallback(async (reset: boolean) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const params = new URLSearchParams({ limit: "20" });
    if (statut !== "TOUS") params.set("statut", statut);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (!reset && cursor) params.set("cursor", cursor);

    try {
      const res = await fetch(`/api/admin/mots?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      setMots((prev) => (reset ? data.data : [...prev, ...data.data]));
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [statut, debouncedSearch, cursor]);

  useEffect(() => {
    fetchMots(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statut, debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 border rounded-lg p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatut(tab.value); setCursor(null); }}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statut === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un mot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : mots.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Aucun mot trouvé.</p>
      ) : (
        <div className="border rounded-xl divide-y">
          {mots.map((mot) => {
            const statutInfo = STATUT_BADGE[mot.statut] ?? { label: mot.statut, variant: "outline" as const };
            return (
              <Link
                key={mot.id}
                href={`/dashboard/moderation/${mot.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-medium truncate">{mot.mot}</span>
                  {mot.categorie && (
                    <Badge
                      className={`text-xs shrink-0 ${categoryColor(mot.categorie)}`}
                      variant="outline"
                    >
                      {categoryLabel(mot.categorie)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0 ml-4">
                  <Badge variant={statutInfo.variant} className="text-xs hidden sm:inline-flex">
                    {statutInfo.label}
                  </Badge>
                  <span className="hidden md:inline">{mot.soumisPar?.name ?? "Anonyme"}</span>
                  <span>{mot._count.votes} vote{mot._count.votes !== 1 ? "s" : ""}</span>
                  <span className="hidden lg:inline">
                    {formatDistanceToNow(new Date(mot.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchMots(false)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Chargement...
              </>
            ) : (
              "Charger plus"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
