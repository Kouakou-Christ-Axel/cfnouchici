FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- Prisma Migrator (npm = flat node_modules, pas de symlinks pnpm) ---
# Mettre à jour la version quand prisma est mis à jour dans package.json
FROM node:22-alpine AS prisma-migrator
WORKDIR /migration
RUN npm install prisma@7.7.0

# --- Dependencies ---
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV SKIP_ENV_VALIDATION=1
ENV DATABASE_URL="postgresql://nouchici:nouchici@localhost:5432/nouchici"

RUN pnpm prisma generate
RUN pnpm build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Prisma CLI + engine pour les migrations au démarrage
# Le stage prisma-migrator utilise npm (flat node_modules) pour éviter les symlinks pnpm
COPY --from=prisma-migrator --chown=nextjs:nodejs /migration/node_modules /app/prisma-cli

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "node /app/prisma-cli/prisma/build/index.js migrate deploy && node server.js"]
