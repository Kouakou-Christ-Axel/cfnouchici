import { getSessionOrRedirect } from "@/lib/auth-guard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await getSessionOrRedirect("/admin", "MODERATEUR");
  return <div className="content-container py-8 space-y-8">{children}</div>;
}
