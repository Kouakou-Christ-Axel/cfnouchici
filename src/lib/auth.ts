import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import {db} from "@/lib/db";
import {env} from "@/app/env";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false,
      },
      banned: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
});
