# CI/CD + GitHub + Dokploy Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publier le repo sur GitHub (public), mettre en place un pipeline CI/CD avec GitHub Actions, et déployer automatiquement sur Dokploy à chaque push sur `main`.

**Architecture:** GitHub Actions exécute le lint à chaque PR/push ; à chaque merge sur `main`, il déclenche un webhook Dokploy qui clone le repo, build l'image Docker via le Dockerfile existant (mode Docker Compose), et redeploie les containers. Le DB Postgres est géré dans le même docker-compose.

**Tech Stack:** GitHub Actions, GitHub CLI (`gh`), Dokploy webhook, Docker Compose, pnpm, Next.js 16

---

## File Structure

| Action | Fichier | Rôle |
|--------|---------|------|
| Create | `.github/workflows/ci.yml` | Lint sur chaque PR et push |
| Create | `.github/workflows/deploy.yml` | Trigger Dokploy webhook sur push `main` |
| Modify | `docker-compose.yml` | Décommenter le service `app` pour Dokploy |

---

## Pré-requis (à faire manuellement une seule fois)

1. Être connecté à GitHub CLI : `gh auth login`
2. Avoir un Dokploy installé sur ton VPS
3. Dans Dokploy : créer un service "Application" de type **Docker Compose**, source GitHub, et récupérer l'URL du webhook de déploiement
4. Ajouter dans GitHub Secrets du repo : `DOKPLOY_WEBHOOK_URL` (l'URL du webhook Dokploy)

---

## Task 1: Créer le repo GitHub public et pousser le code

**Files:**
- Modify: (aucun fichier, commandes git/gh)

- [ ] **Step 1: Créer le repo public sur GitHub**

```bash
gh repo create cfnouchici --public --source=. --remote=origin --description="Dictionnaire collaboratif du Nouchi (argot ivoirien urbain)"
```

Expected output: `✓ Created repository kouakoucaxel/cfnouchici on GitHub`

- [ ] **Step 2: Vérifier que le remote est bien configuré**

```bash
rtk git remote -v
```

Expected:
```
origin  https://github.com/kouakoucaxel/cfnouchici.git (fetch)
origin  https://github.com/kouakoucaxel/cfnouchici.git (push)
```

- [ ] **Step 3: Vérifier que .gitignore protège bien les fichiers sensibles**

S'assurer que `.env` est dans `.gitignore` (déjà présent). Ne JAMAIS pousser `.env`.

```bash
rtk git status
```

Vérifier que `.env` n'apparaît pas dans les fichiers trackés. Si c'est le cas : `git rm --cached .env`

- [ ] **Step 4: Pousser le code vers GitHub**

```bash
rtk git add .claude/settings.local.json .mcp.json next.config.ts package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts src/lib/auth.ts
rtk git commit -m "chore: update config and dependencies"
rtk git push -u origin master
```

- [ ] **Step 5: Créer la branche main et en faire la branche par défaut**

```bash
rtk git checkout -b main
rtk git push -u origin main
gh repo edit --default-branch main
```

---

## Task 2: Créer le workflow CI (lint)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Créer le fichier workflow CI**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm db:generate

      - name: Lint
        run: pnpm lint
```

- [ ] **Step 2: Committer le workflow CI**

```bash
rtk git add .github/workflows/ci.yml
rtk git commit -m "ci: add GitHub Actions lint workflow"
```

---

## Task 3: Créer le workflow de déploiement (deploy)

**Files:**
- Create: `.github/workflows/deploy.yml`

Le workflow déclenche un webhook Dokploy après un push sur `main`. Dokploy récupère alors le code depuis GitHub et redéploie.

- [ ] **Step 1: Créer le fichier workflow deploy**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Dokploy
    runs-on: ubuntu-latest
    needs: []

    steps:
      - name: Trigger Dokploy deploy
        run: |
          curl -s -o /dev/null -w "%{http_code}" \
            -X POST "${{ secrets.DOKPLOY_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" | \
          grep -q "^2" && echo "Deploy triggered successfully" || \
          (echo "Deploy webhook failed" && exit 1)
```

- [ ] **Step 2: Committer le workflow deploy**

```bash
rtk git add .github/workflows/deploy.yml
rtk git commit -m "ci: add Dokploy deploy trigger workflow"
```

---

## Task 4: Mettre à jour docker-compose.yml pour Dokploy

**Files:**
- Modify: `docker-compose.yml`

Décommenter le service `app` pour que Dokploy puisse builder et démarrer l'application via Docker Compose.

- [ ] **Step 1: Mettre à jour docker-compose.yml**

Remplacer le contenu de `docker-compose.yml` par :

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: nouchici
      POSTGRES_PASSWORD: nouchici
      POSTGRES_DB: nouchici
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nouchici"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

> **Note:** Les variables d'environnement (`DATABASE_URL`, etc.) seront définies dans l'interface Dokploy pour le service — **ne jamais les hardcoder** dans ce fichier.

- [ ] **Step 2: Committer docker-compose.yml**

```bash
rtk git add docker-compose.yml
rtk git commit -m "chore: enable app service in docker-compose for Dokploy"
```

---

## Task 5: Pousser tout sur GitHub et configurer Dokploy

**Files:**
- Aucun nouveau fichier

- [ ] **Step 1: Pousser toutes les branches/commits**

```bash
rtk git push origin main
```

- [ ] **Step 2: Ajouter le secret GitHub pour le webhook Dokploy**

Dans GitHub → repo → Settings → Secrets and variables → Actions → New repository secret :
- Name: `DOKPLOY_WEBHOOK_URL`
- Value: l'URL du webhook générée par Dokploy (ex: `https://dokploy.monvps.com/api/deploy/...`)

```bash
# Ou via CLI (remplacer WEBHOOK_URL par la vraie URL):
gh secret set DOKPLOY_WEBHOOK_URL --body "WEBHOOK_URL_ICI"
```

- [ ] **Step 3: Configurer le service dans Dokploy**

Dans l'interface Dokploy :
1. Créer un nouveau projet → "Application" (ou "Compose")
2. Source : **GitHub** (connecter avec OAuth)
3. Repo : `kouakoucaxel/cfnouchici`
4. Branche : `main`
5. Build type : **Docker Compose**
6. Ajouter les variables d'environnement :
   - `DATABASE_URL` = `postgresql://nouchici:nouchici@db:5432/nouchici`
   - `NEXT_PUBLIC_API_URL` = `https://ton-domaine.com`
   - `BETTER_AUTH_SECRET` = (valeur secrète)
   - `BETTER_AUTH_URL` = `https://ton-domaine.com`
   - `GOOGLE_CLIENT_ID` = (valeur depuis Google Cloud Console)
   - `GOOGLE_CLIENT_SECRET` = (valeur depuis Google Cloud Console)
7. Copier l'URL du webhook → l'utiliser dans Step 2
8. Déployer manuellement une première fois pour valider

- [ ] **Step 4: Vérifier le pipeline end-to-end**

Faire un petit commit sur `main` et pousser :
```bash
rtk git commit --allow-empty -m "ci: test deploy pipeline"
rtk git push origin main
```

Vérifier dans GitHub → Actions que les deux workflows (CI + Deploy) passent en vert.
Vérifier dans Dokploy que le déploiement s'est bien déclenché.

---

## Résumé des secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `DOKPLOY_WEBHOOK_URL` | URL du webhook de déploiement généré par Dokploy |

## Variables d'environnement à configurer dans Dokploy

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `postgresql://nouchici:nouchici@db:5432/nouchici` (service interne) |
| `NEXT_PUBLIC_API_URL` | URL publique de ton domaine |
| `BETTER_AUTH_SECRET` | Clé secrète Better Auth (générer avec `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | URL publique de ton domaine |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Secret Google OAuth |
