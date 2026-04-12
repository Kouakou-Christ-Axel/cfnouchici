import { getSessionOrRedirect } from "@/lib/auth-guard";
import { listLogs } from "@/lib/queries/logs";
import { LogsTable } from "@/components/dashboard/logs/logs-table";
import type { ActionModeration } from "@/generated/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ action?: string; moderateurId?: string; from?: string; to?: string; cursor?: string }>;
}

export default async function LogsPage({ searchParams }: PageProps) {
  await getSessionOrRedirect("/dashboard/logs", "ADMIN");
  const params = await searchParams;

  const { data } = await listLogs({
    action: (params.action as ActionModeration) || undefined,
    moderateurId: params.moderateurId,
    from: params.from ? new Date(params.from) : undefined,
    to: params.to ? new Date(params.to) : undefined,
    cursor: params.cursor,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Logs de modération
        </h1>
        <p className="text-muted-foreground text-sm">
          Historique complet des actions des modérateurs.
        </p>
      </header>
      <LogsTable logs={data} />
    </div>
  );
}
