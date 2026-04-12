import { db } from "@/lib/db";
import type { UpdateProfileInput } from "@/lib/validators/me";

export async function deleteMyProposition(userId: string, slug: string) {
  const mot = await db.mot.findUnique({ where: { slug } });
  if (!mot) throw new Error("NOT_FOUND");
  if (mot.soumisParId !== userId) throw new Error("FORBIDDEN");
  if (mot.statut !== "EN_ATTENTE") throw new Error("NOT_PENDING");

  return db.mot.delete({ where: { slug } });
}

export async function updateMyProfile(userId: string, input: UpdateProfileInput) {
  return db.user.update({
    where: { id: userId },
    data: { name: input.name },
  });
}
