import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		if (process.env.SKIP_DB) {
			return null;
		}
		throw new Error("DATABASE_URL environment variable is not set");
	}
	const adapter = new PrismaPg({ connectionString });
	return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | null | undefined;
};

const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

export const db = prismaClient as PrismaClient;
