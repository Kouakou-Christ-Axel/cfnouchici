import { HeroTitle } from "@/components/public/accueil/hero-title";
import { HeroSearch } from "@/components/public/accueil/hero-search";
import { HeroTags } from "@/components/public/accueil/hero-tags";
import { HeroStats } from "@/components/public/accueil/hero-stats";
import Link from "next/link";
import { PenLine } from "lucide-react";

interface HeroSectionProps {
  mots: { slug: string; mot: string }[];
  wordCount: number;
  contributorCount: number;
  voteCount: number;
}

export default function HeroSection({ mots, wordCount, contributorCount, voteCount }: HeroSectionProps) {
  const tags = mots.map((m) => ({ slug: m.slug, mot: m.mot }));

  return (
    <section className="py-16 md:py-24 text-center">
      <div className="content-container">
        <HeroTitle wordCount={wordCount} />
        <HeroSearch />
        <div className="flex justify-center mt-4">
          <Link
            href="/proposer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-2 hover:border-foreground/30 transition-all"
          >
            <PenLine className="size-3.5" />
            Proposer un mot
          </Link>
        </div>
        <HeroTags mots={tags} />
        <HeroStats stats={{ mots: wordCount, contributeurs: contributorCount, votes: voteCount }} />
      </div>
    </section>
  );
}
