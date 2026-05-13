export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSessionOrRedirect } from "@/lib/auth-guard";
import { getMotBySlug } from "@/lib/queries/mots";
import { getVoteSummary } from "@/lib/queries/votes";
import { db } from "@/lib/db";
import { MotEditForm } from "@/components/admin/mot-edit-form";
import { SocialScoreBlock } from "@/components/dashboard/moderation/social-score-block";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ModerationSlugPage({ params }: PageProps) {
  await getSessionOrRedirect("/dashboard/moderation", "MODERATEUR");
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

  const primarySens = mot.sens[0];
  const serializedMot = {
    ...JSON.parse(JSON.stringify(mot)),
    definition: primarySens?.definition ?? "",
    categorie: primarySens?.categorie ?? null,
    exemples: (primarySens?.exemples ?? []).map((e) => ({ id: e.id, contenu: e.phrase })),
  };
  const serializedLogs = JSON.parse(JSON.stringify(rawLogs));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/moderation"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Retour à la modération
        </Link>
      </div>

      <header>
        <h1 className="font-(family-name:--font-heading) text-2xl font-extrabold tracking-tight">
          Modérer : <span className="uppercase">{mot.mot}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Soumis par {mot.soumisPar?.name ?? "Anonyme"} · Statut : {mot.statut}
        </p>
      </header>

      <SocialScoreBlock
        slug={mot.slug}
        initialScore={mot.socialScore ?? 0}
        initialNotes={mot.socialNotes ?? null}
      />

      <MotEditForm
        mot={serializedMot}
        votes={votes}
        logs={serializedLogs}
      />
    </div>
  );
}
