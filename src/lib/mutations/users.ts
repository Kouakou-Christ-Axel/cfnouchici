import { db } from "@/lib/db";
import type { UpdateUserInput } from "@/lib/validators/user";

export async function updateUser(id: string, input: UpdateUserInput) {
  const data: Record<string, unknown> = {};
  if (input.role !== undefined) data.role = input.role;
  if (input.banned !== undefined) {
    data.banned = input.banned;
    data.bannedAt = input.banned ? new Date() : null;
  }
  return db.user.update({ where: { id }, data });
}
