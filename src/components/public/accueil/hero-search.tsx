"use client";

import { Search } from "lucide-react";
import { useSearchModal } from "@/components/search/search-context";

export function HeroSearch() {
  const { open } = useSearchModal();

  return (
    <button
      onClick={open}
      className="flex items-center w-full max-w-xl mx-auto bg-card border border-border rounded-full overflow-hidden mt-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:border-foreground/30 hover:shadow-md transition-all cursor-pointer"
      aria-label="Ouvrir la recherche"
    >
      <Search className="size-4 text-muted-foreground ml-5 shrink-0" />
      <span className="flex-1 bg-transparent border-0 outline-none px-3 py-4 text-base text-muted-foreground text-left">
        Ex: &quot;goumin&quot;, &quot;choco&quot;, &quot;garba&quot;...
      </span>
      <kbd className="flex items-center gap-1 text-xs text-muted-foreground border rounded px-1.5 py-0.5 font-mono mr-4 shrink-0">
        ⌘K
      </kbd>
    </button>
  );
}
