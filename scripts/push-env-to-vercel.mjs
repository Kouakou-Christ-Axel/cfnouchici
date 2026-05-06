#!/usr/bin/env node
/**
 * Reads .env and pushes each variable to Vercel (production + preview + development).
 * Run with: node scripts/push-env-to-vercel.mjs
 * Requires: vercel CLI available (pnpm dlx vercel or global install)
 */
import { readFileSync } from "fs";
import { execSync } from "child_process";

const envFile = readFileSync(".env", "utf8");
const lines = envFile.split("\n");

const SKIP = new Set([
  "NEXT_PUBLIC_API_URL", // not a secret, set separately if needed
]);

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;

  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;

  const key = trimmed.slice(0, eqIdx).trim();
  const raw = trimmed.slice(eqIdx + 1).trim();
  const value = raw.replace(/^["']|["']$/g, ""); // strip surrounding quotes

  if (!key || SKIP.has(key)) continue;

  try {
    console.log(`→ Adding ${key}...`);
    for (const env of ["production", "preview", "development"]) {
      execSync(`pnpm dlx vercel env add ${key} ${env}`, {
        input: value,
        stdio: ["pipe", "inherit", "inherit"],
        encoding: "utf8",
      });
    }
  } catch {
    console.error(`  ✗ Failed for ${key}`);
  }
}

console.log("\n✅ Done. Redeploy with: pnpm dlx vercel --prod");
