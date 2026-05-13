import { PrismaClient } from "../src/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

async function main() {
  // Admin user
  const admin = await prisma.user.upsert({
    where: { id: "seed-admin" },
    update: {},
    create: {
      id: "seed-admin",
      name: "Admin Dev",
      email: "admin@nouchici.dev",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  const words = [
    { mot: "Goumin", definition: "Se battre, se quereller avec quelqu'un.", categorie: "VERBE" as const, exemples: ["Les deux gars ont commencé à goumin devant le maquis."] },
    { mot: "Choco", definition: "Ami proche, frère de galère.", categorie: "NOM" as const, exemples: ["Mon choco m'a aidé quand j'étais dans la galère."] },
    { mot: "Boucantier", definition: "Personne qui fait beaucoup de bruit.", categorie: "NOM" as const, exemples: ["Ce boucantier-là, il va nous faire expulser du quartier."] },
    { mot: "Binguiste", definition: "Conducteur de moto-taxi.", categorie: "NOM" as const, exemples: ["J'ai pris un binguiste pour éviter les embouteillages."] },
    { mot: "Babi", definition: "Abréviation affectueuse d'Abidjan.", categorie: "NOM" as const, exemples: ["Je suis à Babi depuis 10 ans."] },
    { mot: "Gouro", definition: "Argent, monnaie.", categorie: "NOM" as const, exemples: ["J'ai pas de gouro aujourd'hui."] },
    { mot: "Dja", definition: "Partir, s'en aller rapidement.", categorie: "VERBE" as const, exemples: ["Il a dja du maquis sans payer."] },
    { mot: "Zouglou", definition: "Genre musical ivoirien né dans les cités universitaires.", categorie: "NOM" as const, exemples: ["Le zouglou, c'est la musique du peuple."] },
    { mot: "Tchatcher", definition: "Parler avec aisance pour convaincre ou séduire.", categorie: "VERBE" as const, exemples: ["Ce gars-là sait tchatcher les go."] },
    { mot: "Garba", definition: "Plat populaire à base d'attiéké et de thon frit.", categorie: "NOM" as const, exemples: ["On va manger garba au bord de la route."] },
    { mot: "Gbê", definition: "La vie, le destin, la force.", categorie: "NOM" as const, exemples: ["C'est le gbê qui est comme ça."] },
    { mot: "Enjailler", definition: "S'amuser, profiter intensément.", categorie: "VERBE" as const, exemples: ["On va s'enjailler ce weekend!"] },
  ];

  for (const word of words) {
    const slug = word.mot
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const existing = await prisma.mot.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.mot.create({
        data: {
          slug,
          mot: word.mot,
          statut: "VALIDE",
          soumisParId: admin.id,
          sens: {
            create: [
              {
                categorie: word.categorie,
                definition: word.definition,
                traductions: [],
                ordre: 0,
                exemples: {
                  create: word.exemples.map((phrase) => ({ phrase })),
                },
              },
            ],
          },
        },
      });
    }
  }

  console.log(`Seeded ${words.length} words + admin user`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
