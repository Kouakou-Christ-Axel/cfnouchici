import { getSessionOrRedirect } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionOrRedirect("/dashboard");
  const user = session.user as {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
