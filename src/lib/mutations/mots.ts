import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import type { CreateMotInput, UpdateMotInput } from "@/lib/validators/mot";

export async function createMot(input: CreateMotInput, userId: string | null) {
  const slug = generateSlug(input.mot);

  const existing = await db.mot.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("SLUG_EXISTS");
  }

  return db.mot.create({
    data: {
      slug,
      mot: input.mot,
      definition: input.definition,
      categorie: input.categorie ?? null,
      statut: "EN_ATTENTE",
      soumisParId: userId,
      exemples: {
        create: (input.exemples ?? []).map((phrase) => ({ phrase })),
      },
    },
    include: { exemples: true },
  });
}

export async function updateMot(slug: string, input: UpdateMotInput) {
  const data: Record<string, unknown> = {};
  if (input.mot !== undefined) {
    data.mot = input.mot;
    data.slug = generateSlug(input.mot);
  }
  if (input.definition !== undefined) data.definition = input.definition;
  if (input.categorie !== undefined) data.categorie = input.categorie;

  const mot = await db.mot.update({
    where: { slug },
    data,
    include: { exemples: true },
  });

  if (input.exemples !== undefined) {
    await db.exemple.deleteMany({ where: { motId: mot.id } });
    await db.exemple.createMany({
      data: input.exemples.map((phrase) => ({ phrase, motId: mot.id })),
    });
  }

  return db.mot.findUnique({ where: { id: mot.id }, include: { exemples: true } });
}

export async function deleteMot(slug: string) {
  return db.mot.delete({ where: { slug } });
}
