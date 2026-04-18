"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchModal } from "@/components/search/search-context";

export function SearchBar() {
  const { open } = useSearchModal();

  return (
    <>
      {/* Desktop: button with kbd hint */}
      <Button
        variant="outline"
        className="hidden md:flex items-center gap-2 text-muted-foreground text-sm h-9 px-3 w-48 justify-start"
        onClick={open}
        aria-label="Rechercher (⌘K)"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">Chercher…</span>
        <kbd className="flex items-center gap-1 text-xs border rounded px-1.5 py-0.5 font-mono ml-auto">
          ⌘K
        </kbd>
      </Button>

      {/* Mobile: icon only */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden size-9"
        onClick={open}
        aria-label="Rechercher"
      >
        <Search className="size-4" />
      </Button>
    </>
  );
}
