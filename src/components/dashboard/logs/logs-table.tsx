import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActionBadge } from "@/components/dashboard/logs/action-badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Log {
  id: string;
  action: string;
  motif: string | null;
  createdAt: Date;
  moderateur: { id: string; name: string; image: string | null };
  mot: { id: string; slug: string; mot: string };
}

interface LogsTableProps {
  logs: Log[];
}

export function LogsTable({ logs }: LogsTableProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">Aucun log pour le moment.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-32">Quand</TableHead>
          <TableHead>Modérateur</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Mot</TableHead>
          <TableHead>Motif</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="text-xs text-muted-foreground">
              {formatDistanceToNow(log.createdAt, { addSuffix: true, locale: fr })}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={log.moderateur.image ?? undefined} alt={log.moderateur.name} />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] font-bold">
                    {log.moderateur.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{log.moderateur.name}</span>
              </div>
            </TableCell>
            <TableCell><ActionBadge action={log.action} /></TableCell>
            <TableCell>
              <Link href={`/dashboard/moderation/${log.mot.slug}`} className="font-(family-name:--font-heading) font-bold uppercase text-sm hover:underline">
                {log.mot.mot}
              </Link>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
              {log.motif ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
