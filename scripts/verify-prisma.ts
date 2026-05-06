import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

async function verify() {
  const count = await prisma.mot.count();
  console.log(`✅ Connected — ${count} mots in database`);
  await prisma.$disconnect();
}

verify().catch((e) => {
  console.error("❌ Connection failed:", e.message);
  process.exit(1);
});
