import { getSessionOrRedirect } from "@/lib/auth-guard";
import { listMyPropositions } from "@/lib/queries/me";
import { PropositionsTable } from "@/components/dashboard/propositions/propositions-table";
import type { Statut } from "@/generated/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ statut?: string; search?: string; cursor?: string }>;
}

export default async function PropositionsPage({ searchParams }: PageProps) {
  const session = await getSessionOrRedirect("/dashboard/propositions");
  const params = await searchParams;
  const statut = (params.statut as Statut) || undefined;
  const search = params.search || undefined;
  const cursor = params.cursor || undefined;

  const { data: rawData } = await listMyPropositions(session.user.id, { statut, search, cursor, limit: 20 });

  const data = rawData.map((m) => ({
    ...m,
    categorie: m.sens[0]?.categorie ?? null,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">Mes propositions</h1>
        <p className="text-muted-foreground text-sm">Gère tes mots soumis au dictionnaire.</p>
      </header>
      <PropositionsTable propositions={data} />
    </div>
  );
}
