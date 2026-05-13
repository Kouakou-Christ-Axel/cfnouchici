import { PrismaClient } from "../../src/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const db = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate()) as unknown as PrismaClient;

async function migrate() {
  // Idempotent: skip mots that already have a sens
  const mots = await db.mot.findMany({
    where: { sens: { none: {} } },
    include: { exemples: true },
  });

  console.log(`Found ${mots.length} mots without Sens rows.`);

  for (const mot of mots) {
    const sens = await db.sens.create({
      data: {
        motId: mot.id,
        categorie: mot.categorie ?? "NOM",
        definition: mot.definition,
        traductions: [],
        ordre: 0,
      },
    });

    if (mot.exemples.length > 0) {
      await db.exemple.updateMany({
        where: { motId: mot.id, sensId: null },
        data: { sensId: sens.id },
      });
    }
  }

  console.log(`Migration complete: ${mots.length} Sens rows created.`);
  await db.$disconnect();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
