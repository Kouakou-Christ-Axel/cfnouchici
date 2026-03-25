import {createEnv} from "@t3-oss/env-nextjs";
import {z} from "zod";

export const env = createEnv({
	server: {
		CLOUDFLARE_API_TOKEN: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_API_URL: z.string().min(1),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
	onValidationError: (issues) => {
		console.error('❌ Invalid environment variables:', issues);
		process.exit(1);
	},
});