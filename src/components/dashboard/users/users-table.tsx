import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/dashboard/users/role-badge";
import { RoleChangeDialog } from "@/components/dashboard/users/role-change-dialog";
import { BanUserDialog } from "@/components/dashboard/users/ban-user-dialog";

interface UserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
  _count: { motsSoumis: number };
}

interface UsersTableProps {
  users: UserRow[];
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">Aucun utilisateur trouvé.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Contributions</TableHead>
          <TableHead>Inscription</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id} className={u.banned ? "opacity-50" : ""}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={u.image ?? undefined} alt={u.name} />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-bold">
                    {u.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                {u.banned && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px] uppercase">Banni</Badge>
                )}
              </div>
            </TableCell>
            <TableCell><RoleBadge role={u.role} /></TableCell>
            <TableCell className="text-muted-foreground">{u._count.motsSoumis}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {new Date(u.createdAt).toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell className="text-right">
              <div className="inline-flex gap-1">
                <RoleChangeDialog userId={u.id} userName={u.name} currentRole={u.role} />
                <BanUserDialog userId={u.id} userName={u.name} banned={u.banned} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
