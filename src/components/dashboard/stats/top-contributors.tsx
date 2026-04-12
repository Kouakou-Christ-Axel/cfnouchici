import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Contributor {
  id: string;
  name: string;
  validatedCount: number;
}

interface TopContributorsProps {
  contributors: Contributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-5 border-b border-border">
          <h3 className="font-(family-name:--font-heading) font-bold tracking-tight">
            Top contributeurs
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Par nombre de mots validés
          </p>
        </div>
        {contributors.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Aucune contribution.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Mots validés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributors.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right font-(family-name:--font-heading) font-bold">
                    {c.validatedCount}
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
