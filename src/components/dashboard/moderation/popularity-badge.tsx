import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Flame } from "lucide-react";

interface PopularityBadgeProps {
  score: number;
}

export function PopularityBadge({ score }: PopularityBadgeProps) {
  const rounded = Math.round(score);
  const tone =
    score >= 20 ? "bg-red-100 text-red-700" :
    score >= 10 ? "bg-amber-100 text-amber-700" :
    score >= 0 ? "bg-emerald-100 text-emerald-700" :
    "bg-muted text-muted-foreground";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`gap-1 ${tone}`}>
            <Flame className="size-3" />
            {rounded}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Score de popularité : {score.toFixed(1)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
