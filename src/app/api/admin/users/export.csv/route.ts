import { getAdminOnlySession } from "@/lib/auth-helpers";
import { exportUsersCsv } from "@/lib/queries/users";

export async function GET() {
  const { error } = await getAdminOnlySession();
  if (error) return error;

  const csv = await exportUsersCsv();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
