import type {NextConfig} from "next";
import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const nextConfig: NextConfig = {
	output: "standalone",
	serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
	};

export default nextConfig;
