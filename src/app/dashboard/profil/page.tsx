import { getSessionOrRedirect } from "@/lib/auth-guard";
import { ProfileForm } from "@/components/dashboard/profil/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await getSessionOrRedirect("/dashboard/profil");
  const user = session.user as {
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Profil & paramètres
        </h1>
        <p className="text-muted-foreground text-sm">Gère les informations de ton compte.</p>
      </header>
      <ProfileForm user={user} />
    </div>
  );
}
