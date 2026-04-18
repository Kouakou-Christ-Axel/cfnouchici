"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useSearchModal } from "@/components/search/search-context";
import { useSearch } from "@/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { categoryColor, categoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";

export function SearchModal() {
  const { isOpen, open, close } = useSearchModal();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedOnce = useRef(false);
  const router = useRouter();

  const { results, loading } = useSearch(query);

  const showSuggestions = results.length > 0 && query.trim().length >= 2;
  const showEmpty =
    fetchedOnce.current && !loading && query.trim().length >= 2 && results.length === 0;

  // Mod+K to open
  useHotkey("Mod+K", (e) => {
    e.preventDefault();
    open();
  });

  // Track fetch initiated
  useEffect(() => {
    if (loading) fetchedOnce.current = true;
  }, [loading]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function reset() {
    setQuery("");
    setActiveIndex(-1);
    fetchedOnce.current = false;
    close();
  }

  const ariaActiveDescendant =
    activeIndex >= 0 && activeIndex < results.length
      ? `sm-option-${results[activeIndex].id}`
      : activeIndex === results.length
        ? "sm-option-view-all"
        : undefined;

  function handleKeyDown(e: React.KeyboardEvent) {
    const total = results.length + 1;
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
      reset();
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(v) => { if (!v) reset(); }}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              />
            </DialogPrimitive.Overlay>

            {/* Content */}
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border bg-background shadow-2xl overflow-hidden"
                initial={{
                  opacity: 0,
                  filter: "blur(4px)",
                  transform:
                    "translateX(-50%) perspective(500px) rotateX(-20deg) scale(0.8)",
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  transform:
                    "translateX(-50%) perspective(500px) rotateX(0deg) scale(1)",
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(4px)",
                  transform:
                    "translateX(-50%) perspective(500px) rotateX(-20deg) scale(0.8)",
                }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
              >
                <DialogPrimitive.Title className="sr-only">
                  Rechercher un mot
                </DialogPrimitive.Title>

                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                  {loading ? (
                    <Loader2 className="size-4 text-muted-foreground shrink-0 animate-spin" />
                  ) : (
                    <Search className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <input
                    ref={inputRef}
                    role="combobox"
                    aria-expanded={showSuggestions}
                    aria-haspopup="listbox"
                    aria-controls="sm-listbox"
                    aria-activedescendant={ariaActiveDescendant}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(-1);
                      fetchedOnce.current = false;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Chercher un mot nouchi..."
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  />
                  <kbd className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground border rounded px-1.5 py-0.5 font-mono shrink-0">
                    Esc
                  </kbd>
                </div>

                {/* Results */}
                {showSuggestions && (
                  <div id="sm-listbox" role="listbox" className="max-h-80 overflow-y-auto">
                    {results.map((result, i) => (
                      <Link
                        key={result.id}
                        id={`sm-option-${result.id}`}
                        href={`/mots/${result.slug}`}
                        role="option"
                        aria-selected={i === activeIndex}
                        onClick={reset}
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
                              className={cn(
                                "text-[10px] shrink-0",
                                categoryColor(result.categorie)
                              )}
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
                      id="sm-option-view-all"
                      href={`/mots?search=${encodeURIComponent(query)}`}
                      role="option"
                      aria-selected={activeIndex === results.length}
                      onClick={reset}
                      className={cn(
                        "flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t hover:underline",
                        activeIndex === results.length && "bg-muted/50"
                      )}
                    >
                      Voir{" "}
                      {results.length > 1
                        ? `les ${results.length} résultats`
                        : "le résultat"}{" "}
                      pour &ldquo;{query}&rdquo;&nbsp;→
                    </Link>
                  </div>
                )}

                {/* Empty state */}
                {showEmpty && (
                  <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                    Aucun mot trouvé pour <em>&ldquo;{query}&rdquo;</em>
                  </p>
                )}

                {/* Idle state */}
                {!loading && query.trim().length < 2 && (
                  <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                    Tape au moins 2 caractères…
                  </p>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
