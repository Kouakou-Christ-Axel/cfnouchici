import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface LogEntry {
  id: string;
  action: "VALIDE" | "REJETE" | "EDITE";
  motif?: string | null;
  createdAt: string;
  moderateur: { id: string; name: string };
}

interface ModerationLogsProps {
  logs: LogEntry[];
}

const ACTION_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  VALIDE: { label: "Validé", variant: "default" },
  REJETE: { label: "Rejeté", variant: "destructive" },
  EDITE: { label: "Édité", variant: "secondary" },
};

export function ModerationLogs({ logs }: ModerationLogsProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune action de modération.</p>;
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => {
        const config = ACTION_CONFIG[log.action] ?? { label: log.action, variant: "secondary" as const };
        return (
          <li key={log.id} className="flex items-start gap-3 text-sm">
            <Badge variant={config.variant} className="mt-0.5 shrink-0 text-xs">
              {config.label}
            </Badge>
            <div className="space-y-0.5 min-w-0">
              <p className="text-foreground">{log.moderateur.name}</p>
              {log.motif && (
                <p className="text-muted-foreground italic truncate">{log.motif}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
