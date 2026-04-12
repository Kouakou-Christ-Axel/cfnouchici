import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_META: Record<string, { label: string; className: string }> = {
  USER: { label: "Contributeur", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  MODERATEUR: { label: "Modérateur", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role] ?? ROLE_META.USER;
  return (
    <Badge variant="secondary" className={cn("text-[10px] font-semibold uppercase", meta.className)}>
      {meta.label}
    </Badge>
  );
}
