import { getSessionOrRedirect } from "@/lib/auth-guard";
import { getMyStats } from "@/lib/queries/me";
import { UserOverview } from "@/components/dashboard/overview/user-overview";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSessionOrRedirect("/dashboard");
  const stats = await getMyStats(session.user.id);

  return <UserOverview name={session.user.name ?? ""} stats={stats} />;
}
