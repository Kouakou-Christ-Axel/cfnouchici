import { getSessionOrRedirect } from "@/lib/auth-guard";
import { ProposerForm } from "@/components/public/proposer/proposer-form";

export default async function ProposerPage() {
  await getSessionOrRedirect("/proposer");

  return (
    <div className="content-container py-12 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Proposer un mot</h1>
        <p className="text-muted-foreground">
          Soumets un mot nouchi au dictionnaire. Il sera examiné par un modérateur avant publication.
        </p>
      </div>
      <ProposerForm />
    </div>
  );
}
