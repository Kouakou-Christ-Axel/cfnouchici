import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const TONE_CLASSES: Record<string, string> = {
  default: "",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export function StatCard({ label, value, helper, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className={cn("font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight mt-1", TONE_CLASSES[tone])}>
          {value}
        </p>
        {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
      </CardContent>
    </Card>
  );
}
