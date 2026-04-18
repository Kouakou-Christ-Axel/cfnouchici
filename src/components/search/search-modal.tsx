"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SearchItemType,
} from "fumadocs-ui/components/dialog/search";
import { useSearchModal } from "@/components/search/search-context";
import { useSearch } from "@/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { categoryColor, categoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";

export function SearchModal() {
  const { isOpen, open, close } = useSearchModal();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { results, loading } = useSearch(query);

  const handleCmdK = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      open();
    },
    [open]
  );
  useHotkey("Mod+K", handleCmdK);

  function reset() {
    setQuery("");
    close();
  }

  const hasQuery = query.trim().length >= 2;

  const items: SearchItemType[] = hasQuery
    ? [
        ...results.map((r) => ({
          id: r.id,
          type: "page" as const,
          url: `/mots/${r.slug}`,
          content: r.mot,
        })),
        {
          id: "view-all",
          type: "action" as const,
          node: (
            <>
              Voir{" "}
              {results.length > 1
                ? `les ${results.length} résultats`
                : results.length === 1
                  ? "le résultat"
                  : "tous les résultats"}{" "}
              pour &ldquo;{query.trim()}&rdquo;&nbsp;→
            </>
          ),
          onSelect: () => {
            router.push(`/mots?search=${encodeURIComponent(query.trim())}`);
            reset();
          },
        },
      ]
    : [];

  return (
    <SearchDialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) reset();
      }}
      search={query}
      onSearchChange={(v) => {
        setQuery(v);
      }}
      isLoading={loading}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput placeholder="Chercher un mot nouchi..." />
          <SearchDialogClose />
        </SearchDialogHeader>

        <SearchDialogList
          items={hasQuery ? items : null}
          Item={({ item, onClick }) => {
            if (item.type === "action") {
              return (
                <button
                  onClick={() => {
                    onClick();
                    item.onSelect();
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-fd-muted-foreground hover:bg-fd-accent transition-colors border-t border-fd-border hover:underline"
                >
                  {item.node}
                </button>
              );
            }

            const result = results.find((r) => r.id === item.id);
            return (
              <Link
                href={item.url}
                onClick={() => {
                  onClick();
                  reset();
                }}
                className="flex flex-col px-4 py-3 hover:bg-fd-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {result?.mot ?? String(item.content)}
                  </span>
                  {result?.categorie && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] shrink-0",
                        categoryColor(result.categorie)
                      )}
                    >
                      {categoryLabel(result.categorie)}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-fd-muted-foreground line-clamp-1 mt-0.5">
                  {result?.definition}
                </p>
              </Link>
            );
          }}
          Empty={() => (
            <p className="px-4 py-8 text-sm text-fd-muted-foreground text-center">
              Aucun mot trouvé pour <em>&ldquo;{query}&rdquo;</em>
            </p>
          )}
        />

        {!hasQuery && (
          <p className="px-4 py-8 text-sm text-fd-muted-foreground text-center">
            Tape au moins 2 caractères…
          </p>
        )}
      </SearchDialogContent>
    </SearchDialog>
  );
}
