import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    setupFiles: ["./src/tests/setup.ts"],
    env: {
      DATABASE_URL: "postgresql://nouchici:nouchici@localhost:5432/nouchici",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
