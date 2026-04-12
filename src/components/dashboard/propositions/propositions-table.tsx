import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusChip } from "@/components/dashboard/status-chip";
import { DeletePropositionDialog } from "@/components/dashboard/propositions/delete-proposition-dialog";
import { categoryLabel } from "@/lib/category";

interface Proposition {
  id: string;
  slug: string;
  mot: string;
  categorie: string | null;
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
  motifRejet: string | null;
  createdAt: Date;
}

interface PropositionsTableProps {
  propositions: Proposition[];
}

export function PropositionsTable({ propositions }: PropositionsTableProps) {
  if (propositions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">Aucune proposition trouvée.</p>;
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mot</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {propositions.map((prop) => (
            <TableRow key={prop.id}>
              <TableCell className="font-(family-name:--font-heading) font-bold uppercase">{prop.mot}</TableCell>
              <TableCell className="text-muted-foreground">{categoryLabel(prop.categorie)}</TableCell>
              <TableCell>
                {prop.statut === "REJETE" && prop.motifRejet ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span><StatusChip statut={prop.statut} /></span>
                    </TooltipTrigger>
                    <TooltipContent>Motif : {prop.motifRejet}</TooltipContent>
                  </Tooltip>
                ) : (
                  <StatusChip statut={prop.statut} />
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(prop.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="text-right">
                {prop.statut === "VALIDE" && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/mots/${prop.slug}`} aria-label="Voir"><ExternalLink className="size-4" /></Link>
                  </Button>
                )}
                {prop.statut === "EN_ATTENTE" && (
                  <DeletePropositionDialog slug={prop.slug} mot={prop.mot} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
