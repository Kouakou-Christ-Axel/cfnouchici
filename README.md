# Nouchici

Dictionnaire collaboratif du Nouchi — l'argot urbain ivoirien.

## Stack

- **Next.js 16** (App Router, Turbopack, standalone output)
- **PostgreSQL** + **Prisma** (ORM)
- **Better Auth** (authentification, OAuth Google)
- **Tailwind CSS 4** + shadcn/ui + HeroUI
- **Docker** / **Dokploy** (déploiement)

## Démarrage local

### Prérequis

- Node.js 22+
- pnpm
- Docker (pour PostgreSQL)

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/Kouakou-Christ-Axel/cfnouchici.git
cd cfnouchici

# 2. Copier les variables d'environnement
cp .env.example .env
# Remplir les valeurs dans .env

# 3. Démarrer la base de données
docker compose up -d db

# 4. Installer les dépendances
pnpm install

# 5. Appliquer les migrations et générer le client Prisma
pnpm db:generate
pnpm db:migrate

# 6. Lancer le serveur de développement
pnpm dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Copier `.env.example` vers `.env` et renseigner les valeurs :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `NEXT_PUBLIC_API_URL` | URL publique de l'app |
| `BETTER_AUTH_SECRET` | Clé secrète (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | URL publique de l'app |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Secret Google OAuth |

## Commandes

```bash
pnpm dev              # Serveur de développement
pnpm build            # Build de production
pnpm start            # Démarrer le serveur de production
pnpm lint             # Linting ESLint
pnpm db:generate      # Régénérer le client Prisma
pnpm db:migrate       # Appliquer les migrations
pnpm db:push          # Pousser le schéma (développement)
```

## Docker

```bash
# Démarrer app + postgres
docker compose up -d --build

# PostgreSQL seulement (développement local)
docker compose up -d db
```

## CI/CD

- **CI** : lint automatique sur chaque PR et push (`main`/`master`)
- **Deploy** : webhook Dokploy déclenché à chaque push sur `main`

Voir `.github/workflows/` pour les détails.
