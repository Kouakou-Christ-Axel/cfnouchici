export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getMotBySlug } from "@/lib/queries/mots";
import { getVoteSummary } from "@/lib/queries/votes";
import { db } from "@/lib/db";
import { MotEditForm } from "@/components/admin/mot-edit-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminMotDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const mot = await getMotBySlug(slug);
  if (!mot) notFound();

  const [votes, rawLogs] = await Promise.all([
    getVoteSummary(mot.id),
    db.logModeration.findMany({
      where: { motId: mot.id },
      include: { moderateur: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Serialize dates to avoid Next.js serialization issues
  const serializedMot = JSON.parse(JSON.stringify(mot));
  const serializedLogs = JSON.parse(JSON.stringify(rawLogs));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Retour au tableau de bord
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{mot.mot}</h1>
        <p className="text-sm text-muted-foreground">
          Soumis par {mot.soumisPar?.name ?? "Anonyme"} · Statut : {mot.statut}
        </p>
      </div>

      <MotEditForm mot={serializedMot} votes={votes} logs={serializedLogs} />
    </div>
  );
}
