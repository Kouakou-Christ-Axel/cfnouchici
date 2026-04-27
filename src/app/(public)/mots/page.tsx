// src/app/(public)/mots/page.tsx
import React from 'react';
import Link from "next/link";
import type { Metadata } from "next";
import { listAllMotsValides } from "@/lib/queries/mots";
import { searchMots } from "@/lib/queries/search";
import { categoryLabel, categoryColor } from "@/lib/category";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import { WordGroup } from "@/components/public/mots/word-group";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tous les mots — Nouchici",
  description: "Explore le dictionnaire complet du nouchi ivoirien.",
};

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function MotsListPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const q = search?.trim() ?? "";

  // ── Search mode ──────────────────────────────────────────────────────────
  if (q.length >= 2) {
    const results = await searchMots(q);

    return (
      <div className="content-container py-12 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
            Résultats pour<br />
            <span className="text-red-500">&ldquo;{q}&rdquo;</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {results.length === 0
              ? "Aucun mot trouvé."
              : `${results.length} mot${results.length > 1 ? "s" : ""} trouvé${results.length > 1 ? "s" : ""}`}
          </p>
        </header>

        {results.length > 0 && (
          <ul className="divide-y border rounded-xl overflow-hidden">
            {results.map((mot) => (
              <li key={mot.id}>
                <Link
                  href={`/mots/${mot.slug}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-5 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold">{mot.mot}</span>
                    {mot.categorie && (
                      <Badge
                        variant="outline"
                        className={`text-[11px] shrink-0 ${categoryColor(mot.categorie)}`}
                      >
                        {categoryLabel(mot.categorie)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 sm:flex-1">
                    {mot.definition}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div>
          <Link href="/mots" className="text-sm text-muted-foreground hover:underline">
            ← Voir tous les mots
          </Link>
        </div>
      </div>
    );
  }

  // ── Mode normal (liste alphabétique) ─────────────────────────────────────
  const mots = await listAllMotsValides();

  const grouped = mots.reduce<Record<string, typeof mots>>((acc, mot) => {
    const letter = mot.mot[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(mot);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();
  const contributeurs = new Set(mots.map(m => m.soumisParId).filter(Boolean)).size;

  return (
    <>
      <div className="content-container py-12 space-y-12">
        {/* ── Header ─────────────────────────────────────── */}
        <header className="space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1 flex items-center gap-1.5 w-fit">
            <BookOpen className="size-3.5"/>
            Dictionnaire
          </Badge>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
                Tous les mots
                <br/>
                <span className="text-muted-foreground">du nouchi</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-lg">
                {mots.length} mots documentés par la communauté ivoirienne.
              </p>
            </div>
            <Button asChild className="gap-2 shrink-0">
              <Link href="/proposer">
                <Plus className="size-4"/>
                Proposer un mot
              </Link>
            </Button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Mots", value: mots.length },
              { label: "Catégories", value: new Set(mots.map((m) => m.categorie)).size },
              { label: "Contributeurs", value: contributeurs },
            ].map(({ label, value }) => (
              <Card key={label} className="py-4">
                <CardContent className="flex flex-col items-center text-center px-4 py-0 gap-0.5">
                  <span className="text-2xl font-semibold tracking-tight">{value}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </header>

        <Separator/>

        {/* ── Index alphabétique ─────────────────────────── */}
        <nav className="flex flex-wrap gap-2" aria-label="Index alphabétique">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="size-8 flex items-center justify-center rounded-md text-sm font-medium border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {letter}
            </a>
          ))}
        </nav>

        <Separator/>

        {/* ── Groupes ────────────────────────────────────── */}
        <div className="space-y-14">
          {letters.map((letter) => (
            <WordGroup key={letter} letter={letter} mots={grouped[letter]}/>
          ))}
        </div>

        {/* ── CTA bas de page ────────────────────────────── */}
        <Separator/>
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <p className="text-muted-foreground text-sm max-w-md">
            Tu connais un mot qui manque ? La communauté t&apos;attend pour l&apos;ajouter au dictionnaire.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/proposer">
              <Plus className="size-4"/>
              Proposer un mot
            </Link>
          </Button>
        </div>
      </div>
      <ScrollToTop/>
    </>
  );
}
