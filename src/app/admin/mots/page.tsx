export const dynamic = "force-dynamic";

import { MotsTable } from "@/components/admin/mots-table";
import { List } from "lucide-react";

export default function AdminMotsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <List className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tous les mots</h1>
          <p className="text-sm text-muted-foreground">Parcourez et filtrez l&apos;ensemble des contributions</p>
        </div>
      </div>
      <MotsTable />
    </div>
  );
}
