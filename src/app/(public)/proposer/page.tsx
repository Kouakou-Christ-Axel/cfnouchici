import { ProposerForm } from "@/components/public/proposer/proposer-form";

export default function ProposerPage() {
  return (
    <div className="content-container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
            Proposer un mot
          </h1>
          <p className="text-muted-foreground text-sm">
            Soumets un mot nouchi au dictionnaire. Il sera examiné par un modérateur avant publication.
          </p>
        </header>
        <ProposerForm />
      </div>
    </div>
  );
}
