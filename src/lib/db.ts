import {cache} from "react";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "@/generated/prisma";

export const getDb = cache(() => {
	const connectionString = process.env.PG_URL ?? "";
	const adapter = new PrismaPg({ connectionString, maxUses: 1 });
	return new PrismaClient({adapter});
});

