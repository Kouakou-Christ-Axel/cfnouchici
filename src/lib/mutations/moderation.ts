import { db } from "@/lib/db";
import { updateMot } from "@/lib/mutations/mots";
import type { UpdateMotInput } from "@/lib/validators/mot";

export async function validerMot(slug: string, moderateurId: string) {
  const mot = await db.mot.update({
    where: { slug },
    data: { statut: "VALIDE", valideParId: moderateurId },
  });

  await db.logModeration.create({
    data: { action: "VALIDE", motId: mot.id, moderateurId },
  });

  return mot;
}

export async function rejeterMot(slug: string, moderateurId: string, motif: string) {
  const mot = await db.mot.update({
    where: { slug },
    data: { statut: "REJETE", motifRejet: motif },
  });

  await db.logModeration.create({
    data: { action: "REJETE", motif, motId: mot.id, moderateurId },
  });

  return mot;
}

export async function editerMotAdmin(slug: string, input: UpdateMotInput, moderateurId: string) {
  const result = await updateMot(slug, input);

  if (result) {
    await db.logModeration.create({
      data: { action: "EDITE", motId: result.id, moderateurId },
    });
  }

  return result;
}
