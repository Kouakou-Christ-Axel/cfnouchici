import { Badge } from "@/components/ui/badge";

interface HeroTitleProps {
  wordCount: number;
}

export function HeroTitle({ wordCount }: HeroTitleProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Badge
        variant="secondary"
        className="rounded-full px-4 py-1.5 text-sm font-medium border border-border"
      >
        🇨🇮 +{wordCount} mots documentés par la communauté
      </Badge>

      <h1 className="font-(family-name:--font-heading) text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95]">
        C'est quoi
        <br />
        ce <span className="text-accent-gradient">mot</span> là ?
      </h1>

      <p className="text-muted-foreground text-base md:text-lg max-w-lg">
        Le street talk ivoirien, expliqué par ceux qui le parlent.
      </p>
    </div>
  );
}
