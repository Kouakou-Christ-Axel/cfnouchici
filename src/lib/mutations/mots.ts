import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import type { CreateMotInput, UpdateMotInput } from "@/lib/validators/mot";

const sensInclude = {
  orderBy: { ordre: "asc" as const },
  include: { exemples: true },
};

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
      statut: "EN_ATTENTE",
      soumisParId: userId,
      sens: {
        create: [
          {
            categorie: input.categorie ?? "NOM",
            definition: input.definition,
            traductions: [],
            ordre: 0,
            exemples: {
              create: (input.exemples ?? []).filter(Boolean).map((phrase) => ({ phrase })),
            },
          },
        ],
      },
    },
    include: { sens: sensInclude },
  });
}

export async function updateMot(slug: string, input: UpdateMotInput) {
  const motData: Record<string, unknown> = {};
  if (input.mot !== undefined) {
    motData.mot = input.mot;
    motData.slug = generateSlug(input.mot);
  }

  const mot = await db.mot.update({
    where: { slug },
    data: motData,
    include: { sens: sensInclude },
  });

  const needsSensUpdate =
    input.definition !== undefined ||
    input.categorie !== undefined ||
    input.exemples !== undefined;

  if (needsSensUpdate) {
    const firstSens = mot.sens[0];
    if (firstSens) {
      await db.sens.update({
        where: { id: firstSens.id },
        data: {
          ...(input.definition !== undefined ? { definition: input.definition } : {}),
          ...(input.categorie !== undefined ? { categorie: input.categorie } : {}),
        },
      });
      if (input.exemples !== undefined) {
        await db.exemple.deleteMany({ where: { sensId: firstSens.id } });
        if (input.exemples.length > 0) {
          await db.exemple.createMany({
            data: input.exemples.filter(Boolean).map((phrase) => ({ phrase, sensId: firstSens.id })),
          });
        }
      }
    }
  }

  return db.mot.findUnique({
    where: { id: mot.id },
    include: { sens: sensInclude },
  });
}

export async function deleteMot(slug: string) {
  return db.mot.delete({ where: { slug } });
}
