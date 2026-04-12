import { getSessionOrRedirect } from "@/lib/auth-guard";
import { listUsers } from "@/lib/queries/users";
import { UsersTable } from "@/components/dashboard/users/users-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Role } from "@/generated/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string; sort?: string; cursor?: string }>;
}

export default async function UtilisateursPage({ searchParams }: PageProps) {
  await getSessionOrRedirect("/dashboard/utilisateurs", "ADMIN");
  const params = await searchParams;

  const { data } = await listUsers({
    search: params.search,
    role: (params.role as Role) || undefined,
    sort: (params.sort as "recent" | "oldest" | "contributions" | "name") || undefined,
    cursor: params.cursor,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
            Utilisateurs
          </h1>
          <p className="text-muted-foreground text-sm">Gestion des rôles et bannissements.</p>
        </div>
        <Button variant="outline" asChild className="rounded-full">
          <a href="/api/admin/users/export.csv">
            <Download className="size-4 mr-2" />
            Exporter CSV
          </a>
        </Button>
      </header>
      <UsersTable users={data} />
    </div>
  );
}
