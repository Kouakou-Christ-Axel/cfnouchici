import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ConnexionForm } from "@/components/public/connexion/connexion-form";
import { BASE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Connexion | nouchi.ci",
  description: "Connecte-toi pour proposer des mots au dictionnaire collaboratif du nouchi ivoirien.",
  alternates: {
    canonical: `${BASE_URL}/connexion`,
  },
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const callbackURL = callbackUrl ?? "/";

  return (
    <div className="content-container py-20 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground">
              Connecte-toi pour proposer des mots au dictionnaire.
            </p>
          </div>
          <ConnexionForm callbackURL={callbackURL} />
        </CardContent>
      </Card>
    </div>
  );
}
