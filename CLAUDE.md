# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nouchici — a collaborative online dictionary for Nouchi (Ivorian urban slang). French-language application with blog, word contributions, and community features.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Generate Prisma client + Next.js production build
pnpm lint             # ESLint (next/core-web-vitals + next/typescript)
pnpm db:generate      # Regenerate Prisma client
pnpm db:migrate       # Run pending migrations (production)
pnpm db:push          # Push schema changes to DB (development)
```

Local dev with Docker (optional):
```bash
docker compose up -d          # Start postgres only
```

## Architecture

**Framework:** Next.js 16 (App Router, Turbopack). Deployed on Vercel.

**Data flow:** Currently all content (words, blog posts) is served from static TypeScript config files in `src/config/`. The database (PostgreSQL + Prisma) is set up but only wired for authentication (Better Auth). Pages use ISR with `revalidate = 3600`.

**Key directories:**
- `src/config/` — Static data: `words.ts` (dictionary entries), `blog.ts` (articles), `navigation.ts` (nav links, popular/recent words)
- `src/components/public/` — Domain-specific page sections grouped by route: `accueil/`, `mots/`, `blog/`
- `src/components/ui/` — shadcn/Radix UI primitives
- `src/components/layouts/` — Navbar, Footer, ThemeSwitcher
- `src/components/animate-ui/` — Custom animation components (GravityStarsBackground, ShimmeringText)
- `src/lib/` — `db.ts` (Prisma singleton), `auth.ts` (Better Auth), `utils.ts` (cn helper), `category.ts`
- `src/generated/prisma/` — Auto-generated Prisma client (custom output path, not node_modules)

**Routes:**
- `/` — Homepage (hero + trust + popular/recent words sections)
- `/mots` — All words with alphabetical grouping
- `/mots/[slug]` — Word detail with ISR
- `/mots/lettre/[lettre]` — Words filtered by letter
- `/blog` — Blog listing
- `/blog/[slug]` — Blog post detail with ISR

## Styling

Tailwind CSS 4 with oklch CSS variables. Theming via `next-themes` (light/dark with system preference). Three UI layers: shadcn components (radix-nova style), HeroUI for Navbar, and custom animated components. Fonts: Inter (sans), with Outfit/Merriweather/Fira Code as CSS variable alternates.

## Prisma

Schema at `prisma/schema.prisma`, config at `prisma.config.ts` (provides DATABASE_URL). Client generated to `src/generated/prisma/`. Current models: User, Session, Account, Verification (auth only). Preview feature: `fullTextSearchPostgres`.

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (server)
- `NEXT_PUBLIC_API_URL` — Public API URL (client)
- `BETTER_AUTH_SECRET` — Auth secret (server)

Validated via `@t3-oss/env-nextjs` + Zod in `src/app/env.ts`.

## Deployment

**Platform:** Vercel (serverless). Push to `main` → déploiement automatique.

**Base de données:** Prisma Postgres — connection pooling intégré via Prisma Accelerate, indispensable pour éviter l'épuisement des connexions en serverless. Deux URLs à configurer :
- `DATABASE_URL` — URL `prisma://` Accelerate (utilisée par Prisma à runtime, via `@prisma/extension-accelerate`)
- `DIRECT_URL` — URL `postgresql://` directe (utilisée pour les migrations uniquement)

**Variables d'environnement à configurer dans Vercel Dashboard :**
- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (URL de production)
