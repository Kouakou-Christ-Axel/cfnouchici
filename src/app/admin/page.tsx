export const dynamic = "force-dynamic";

import { getAdminStats } from "@/lib/queries/admin";
import { listAllMots } from "@/lib/queries/admin";
import { StatsCards } from "@/components/admin/stats-cards";
import { Badge } from "@/components/ui/badge";
import { categoryColor, categoryLabel } from "@/lib/category";
import Link from "next/link";
import { Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default async function AdminPage() {
  const [stats, { data: enAttenteMots }] = await Promise.all([
    getAdminStats(),
    listAllMots({ statut: "EN_ATTENTE", limit: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Gestion et modération du dictionnaire nouchi</p>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mots en attente</h2>
          <Link href="/admin/mots" className="text-sm text-primary hover:underline">
            Voir tous les mots
          </Link>
        </div>

        {enAttenteMots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aucun mot en attente de modération.</p>
        ) : (
          <div className="border rounded-xl divide-y">
            {enAttenteMots.map((mot) => (
              <Link
                key={mot.id}
                href={`/admin/mots/${mot.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-medium truncate">{mot.mot}</span>
                  {mot.categorie && (
                    <Badge className={`text-xs shrink-0 ${categoryColor(mot.categorie)}`} variant="outline">
                      {categoryLabel(mot.categorie)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0 ml-4">
                  <span className="hidden sm:inline">{mot.soumisPar?.name ?? "Anonyme"}</span>
                  <span>{mot._count.votes} vote{mot._count.votes !== 1 ? "s" : ""}</span>
                  <span className="hidden md:inline">
                    {formatDistanceToNow(new Date(mot.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
