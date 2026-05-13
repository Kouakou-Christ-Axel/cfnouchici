import type { Metadata } from "next";
import { ProposerForm } from "@/components/public/proposer/proposer-form";
import { BASE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Proposer un mot | nouchi.ci",
  description: "Contribue au dictionnaire nouchi en soumettant un nouveau mot. Ta proposition sera examinée par un modérateur avant publication.",
  alternates: {
    canonical: `${BASE_URL}/proposer`,
  },
};

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
