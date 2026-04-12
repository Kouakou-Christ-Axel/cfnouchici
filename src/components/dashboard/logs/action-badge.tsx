import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const META: Record<string, { label: string; className: string }> = {
  VALIDE: { label: "Validé", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  REJETE: { label: "Rejeté", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  EDITE: { label: "Édité", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
};

export function ActionBadge({ action }: { action: string }) {
  const meta = META[action] ?? { label: action, className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="secondary" className={cn("text-[10px] font-semibold uppercase", meta.className)}>
      {meta.label}
    </Badge>
  );
}
