// src/components/layouts/general/search-bar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearch, type SearchResult } from "@/hooks/use-search";
import { categoryColor, categoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";

// ─── Suggestions list ────────────────────────────────────────────────────────

interface SuggestionsListProps {
  results: SearchResult[];
  query: string;
  activeIndex: number;
  onClose: () => void;
}

function SuggestionsList({
  results,
  query,
  activeIndex,
  onClose,
}: SuggestionsListProps) {
  return (
    <div role="listbox" className="rounded-xl border bg-popover shadow-lg overflow-hidden">
      {results.map((result, i) => (
        <Link
          key={result.id}
          href={`/mots/${result.slug}`}
          role="option"
          aria-selected={i === activeIndex}
          onClick={onClose}
          className={cn(
            "flex flex-col px-4 py-3 hover:bg-muted/50 transition-colors",
            i === activeIndex && "bg-muted/50"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{result.mot}</span>
            {result.categorie && (
              <Badge
                variant="outline"
                className={cn("text-[10px] shrink-0", categoryColor(result.categorie))}
              >
                {categoryLabel(result.categorie)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {result.definition}
          </p>
        </Link>
      ))}
      <Link
        href={`/mots?search=${encodeURIComponent(query)}`}
        role="option"
        aria-selected={activeIndex === results.length}
        onClick={onClose}
        className={cn(
          "flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t hover:underline",
          activeIndex === results.length && "bg-muted/50"
        )}
      >
        Voir les {results.length} résultat{results.length > 1 ? "s" : ""} pour &ldquo;{query}&rdquo;&nbsp;→
      </Link>
    </div>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { results, loading } = useSearch(query);
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showSuggestions = results.length > 0 && query.trim().length >= 2;
  const showEmpty = !loading && query.trim().length >= 2 && results.length === 0;

  // Auto-focus desktop input on expand
  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  // Auto-focus mobile input after dialog opens
  useEffect(() => {
    if (isMobileOpen) {
      const t = setTimeout(() => mobileInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isMobileOpen]);

  // Close desktop on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsExpanded(false);
        setQuery("");
        setActiveIndex(-1);
      }
    }
    if (isExpanded) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isExpanded]);

  function reset() {
    setQuery("");
    setIsExpanded(false);
    setIsMobileOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const total = results.length + 1; // +1 for "Voir tous"

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        router.push(`/mots/${results[activeIndex].slug}`);
        reset();
      } else if (query.trim().length >= 2) {
        router.push(`/mots?search=${encodeURIComponent(query.trim())}`);
        reset();
      }
    } else if (e.key === "Escape") {
      if (showSuggestions) {
        setQuery("");
        setActiveIndex(-1);
      } else {
        setIsExpanded(false);
      }
    }
  }

  return (
    <>
      {/* ── Desktop ──────────────────────────────────────────────────── */}
      <div ref={containerRef} className="hidden md:flex items-center relative">
        {/* Expandable input */}
        <div
          className={cn(
            "overflow-hidden transition-[width] duration-200 ease-out",
            isExpanded ? "w-72" : "w-0"
          )}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              role="combobox"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Chercher un mot..."
              className="pl-8 pr-8 h-9 text-sm"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Loupe / close toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => {
            if (isExpanded) {
              reset();
            } else {
              setIsExpanded(true);
            }
          }}
          aria-label={isExpanded ? "Fermer la recherche" : "Rechercher"}
        >
          {isExpanded ? (
            <X className="size-4" />
          ) : (
            <Search className="size-4" />
          )}
        </Button>

        {/* Popover suggestions */}
        {isExpanded && showSuggestions && (
          <div className="absolute top-full right-0 mt-2 w-80 z-50">
            <SuggestionsList
              results={results}
              query={query}
              activeIndex={activeIndex}
              onClose={reset}
            />
          </div>
        )}

        {/* Empty state */}
        {isExpanded && showEmpty && (
          <div className="absolute top-full right-0 mt-2 w-80 z-50 rounded-xl border bg-popover shadow-lg px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun mot trouvé pour <em>&ldquo;{query}&rdquo;</em>
            </p>
          </div>
        )}
      </div>

      {/* ── Mobile trigger ───────────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden size-9"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Rechercher"
      >
        <Search className="size-4" />
      </Button>

      {/* ── Mobile Dialog ────────────────────────────────────────────── */}
      <Dialog open={isMobileOpen} onOpenChange={(open) => { if (!open) reset(); }}>
        <DialogContent className="top-0 translate-y-0 p-0 max-w-full h-dvh flex flex-col gap-0 rounded-none sm:rounded-none border-0">
          <DialogTitle className="sr-only">Rechercher un mot</DialogTitle>

          {/* Search input bar */}
          <div className="flex items-center gap-2 p-3 border-b shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={mobileInputRef}
                role="combobox"
                aria-expanded={showSuggestions}
                aria-haspopup="listbox"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Chercher un mot nouchi..."
                className="pl-9 h-10"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <Button variant="ghost" className="shrink-0 text-sm" onClick={reset}>
              Annuler
            </Button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {showSuggestions && (
              <SuggestionsList
                results={results}
                query={query}
                activeIndex={activeIndex}
                onClose={reset}
              />
            )}
            {showEmpty && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Aucun mot trouvé pour <em>&ldquo;{query}&rdquo;</em>
              </p>
            )}
            {!loading && query.trim().length < 2 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Tape au moins 2 caractères…
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
