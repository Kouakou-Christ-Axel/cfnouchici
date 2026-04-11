# Phase 1 : Fondation — Spec

Poser les bases de Nouchici : mots dynamiques en base, authentification Google OAuth, API CRUD, permissions CASL, et refactoring des pages statiques. Approche TDD avec Vitest.

## Schéma Prisma

### Enums

```prisma
enum Categorie {
  NOM
  VERBE
  ADJECTIF
  EXPRESSION
  ADVERBE
}

enum Statut {
  EN_ATTENTE
  VALIDE
  REJETE
}

enum Role {
  USER
  MODERATEUR
  ADMIN
}
```

### Modèle Mot

```prisma
model Mot {
  id            String     @id @default(cuid())
  slug          String     @unique
  mot           String
  definition    String
  categorie     Categorie?
  statut        Statut     @default(EN_ATTENTE)
  motifRejet    String?

  soumisParId   String?
  soumisPar     User?      @relation("SoumisPar", fields: [soumisParId], references: [id])
  valideParId   String?
  validePar     User?      @relation("ValidePar", fields: [valideParId], references: [id])

  exemples      Exemple[]

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@map("mot")
}
```

### Modèle Exemple

```prisma
model Exemple {
  id        String @id @default(cuid())
  phrase    String
  motId     String
  mot       Mot    @relation(fields: [motId], references: [id], onDelete: Cascade)

  @@map("exemple")
}
```

### Modifications User existant

- Ajout du champ `role Role @default(USER)`
- Ajout des relations `motsSoumis Mot[] @relation("SoumisPar")` et `motsValides Mot[] @relation("ValidePar")`

## Permissions (CASL)

Dépendance : `@casl/ability`

### Abilities par rôle

| Action | Sujet | USER | MODERATEUR | ADMIN |
|--------|-------|------|------------|-------|
| `read` | `Mot` (VALIDE) | oui | oui | oui |
| `create` | `Mot` | oui | oui | oui |
| `update` | `Mot` (ses propres, EN_ATTENTE) | oui | non | non |
| `read` | `Mot` (tous statuts) | non | oui | oui |
| `moderate` | `Mot` (valider/rejeter/éditer) | non | oui | oui |
| `manage` | `all` | non | non | oui |

### Structure fichiers

- `src/lib/casl/abilities.ts` — définition des abilities par rôle
- `src/lib/casl/types.ts` — types AppAbility, Actions, Subjects

## Auth Google OAuth

### Setup

- Better Auth avec Google provider uniquement
- Route handler : `/api/auth/[...all]`
- Rôle `USER` attribué par défaut à l'inscription
- Protection des routes via `proxy.ts` (pas middleware.ts)

### Pages

- `/connexion` — bouton "Se connecter avec Google"
- Pas de page d'inscription séparée (Google OAuth gère les deux cas)

### Routes protégées / publiques

- **Protégées :** `/proposer`, `/admin/*`
- **Publiques :** `/`, `/mots/*`, `/blog/*`, `/a-propos`, `/connexion`

### Navbar

- Décommenter le bouton "Se connecter"
- Si connecté : avatar + dropdown (profil, déconnexion, lien admin si MODERATEUR/ADMIN)

### Variables d'environnement ajoutées

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BETTER_AUTH_SECRET` (existant)
- `BETTER_AUTH_URL` — URL de base de l'app

## API (Route Handlers Next.js)

### Endpoints

| Route | Méthode | Description | Accès |
|-------|---------|-------------|-------|
| `/api/auth/[...all]` | * | Better Auth handler | Public |
| `/api/mots` | GET | Liste des mots VALIDE (pagination, recherche, filtre catégorie/lettre) | Public |
| `/api/mots` | POST | Soumettre un mot (statut EN_ATTENTE) | USER+ |
| `/api/mots/[slug]` | GET | Détail d'un mot VALIDE | Public |
| `/api/mots/[slug]` | PUT | Modifier son propre mot EN_ATTENTE | USER (auteur) |
| `/api/mots/[slug]` | DELETE | Supprimer son propre mot EN_ATTENTE | USER (auteur) |

### Validation

Zod schemas pour chaque body de requête (création, mise à jour).

### Pagination

Cursor-based avec `limit` + `cursor`.

### Recherche

`fullTextSearchPostgres` de Prisma sur les champs `mot` et `definition`.

## Seed dev

- `prisma/seed.ts` — injecte les mots de `words.ts` + un user admin de test
- Script `db:seed` dans package.json
- Dev uniquement, les données statiques actuelles sont fictives
- Base vide en production

## Refactoring pages

Pages refactorisées pour lire la DB au lieu de `src/config/words.ts` :

- `/mots` — liste tous les mots VALIDE
- `/mots/[slug]` — détail d'un mot
- `/mots/lettre/[lettre]` — mots filtrés par lettre
- `/` (homepage) — sections popular/recent depuis la DB

`src/config/words.ts` et les parties mots de `src/config/navigation.ts` sont supprimés après refactoring.

## Testing (TDD)

### Framework

Vitest avec config alias `@/`, environment `node` pour les tests API.

### Setup test

`prisma/test-setup.ts` — base de test isolée, reset entre les suites.

### Stratégie

| Couche | Ce qu'on teste | Type |
|--------|---------------|------|
| CASL | Abilities par rôle | Unitaire |
| Zod schemas | Validation des payloads | Unitaire |
| API routes | Chaque endpoint (nominal + erreurs + permissions) | Intégration |
| Seed | Exécution sans erreur | Intégration |

### Ordre TDD

1. Tests CASL → implém abilities
2. Tests Zod schemas → implém schemas
3. Tests API GET mots → implém route + query DB
4. Tests API POST mot → implém route + création
5. Tests API PUT/DELETE → implém routes
6. Refactoring pages pour lire la DB
7. Seed dev

### Hors scope Phase 1

- Tests composants React
- Tests E2E (Playwright)
- Auth Google (mock du provider en test)
