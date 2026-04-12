import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Moderator {
  id: string;
  name: string;
  count: number;
}

interface TopModeratorsProps {
  moderators: Moderator[];
}

export function TopModerators({ moderators }: TopModeratorsProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-5 border-b border-border">
          <h3 className="font-(family-name:--font-heading) font-bold tracking-tight">
            Top modérateurs (7 derniers jours)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Par nombre d&apos;actions
          </p>
        </div>
        {moderators.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Aucune action cette semaine.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moderators.map((m, i) => (
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-right font-(family-name:--font-heading) font-bold">
                    {m.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
