import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface HeroTagsProps {
  mots: { slug: string; mot: string }[];
}

export function HeroTags({ mots }: HeroTagsProps) {
  if (mots.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
      <span className="text-sm text-muted-foreground">Populaires :</span>
      {mots.map((mot, i) => (
        <Link key={mot.slug} href={`/mots/${mot.slug}`}>
          <Badge
            variant={i === 0 ? "default" : "secondary"}
            className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
          >
            {i === 0 ? `🔥 ${mot.mot}` : mot.mot}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
