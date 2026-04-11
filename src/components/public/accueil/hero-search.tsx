"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/mots?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full max-w-xl mx-auto bg-card border border-border rounded-full overflow-hidden mt-8 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow"
    >
      <Search className="size-4 text-muted-foreground ml-5 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Ex: "goumin", "choco", "garba"...'
        className="flex-1 bg-transparent border-0 outline-none px-3 py-4 text-base placeholder:text-muted-foreground"
      />
      <Button type="submit" className="rounded-full m-1.5 shrink-0">
        Chercher
      </Button>
    </form>
  );
}
