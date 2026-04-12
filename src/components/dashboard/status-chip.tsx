import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
}

const CONFIG: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "En attente", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  VALIDE: { label: "Validé", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  REJETE: { label: "Rejeté", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function StatusChip({ statut }: StatusChipProps) {
  const config = CONFIG[statut];
  return (
    <Badge variant="secondary" className={cn("text-[10px] font-semibold uppercase", config.className)}>
      {config.label}
    </Badge>
  );
}
